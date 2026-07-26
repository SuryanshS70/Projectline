import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

const paramsSchema = z.object({
  deliverableId: z.string().min(1),
});

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("READY_FOR_REVIEW") }),
  z.object({ action: z.literal("SUBMIT") }),
  z.object({
    action: z.literal("APPROVE"),
    clientFeedback: z.string().trim().max(2000).optional(),
  }),
  z.object({
    action: z.literal("REQUEST_CHANGES"),
    clientFeedback: z.string().trim().min(1).max(2000),
  }),
]);

export const deliverablesRouter = Router();

deliverablesRouter.use(authenticate);

deliverablesRouter.patch("/:deliverableId", async (request, response, next) => {
  try {
    const { deliverableId } = paramsSchema.parse(request.params);
    const input = actionSchema.parse(request.body);
    const deliverable = await prisma.deliverable.findFirst({
      where: {
        id: deliverableId,
        project: {
          members: {
            some: { userId: request.user!.id },
          },
        },
      },
    });

    if (!deliverable) {
      response.status(404).json({
        success: false,
        error: { message: "Deliverable not found" },
      });
      return;
    }

    const vendorAction = input.action === "READY_FOR_REVIEW" || input.action === "SUBMIT";
    if (vendorAction && request.user!.role !== "VENDOR") {
      response.status(403).json({
        success: false,
        error: { message: "Only vendor users may submit deliverables" },
      });
      return;
    }
    if (!vendorAction && request.user!.role !== "CLIENT") {
      response.status(403).json({
        success: false,
        error: { message: "Only client users may review deliverables" },
      });
      return;
    }

    if (input.action === "READY_FOR_REVIEW" && deliverable.submissionStatus !== "NOT_SUBMITTED") {
      response.status(400).json({
        success: false,
        error: { message: "Only unsubmitted deliverables can be marked ready for review" },
      });
      return;
    }

    if (
      input.action === "SUBMIT" &&
      !["NOT_SUBMITTED", "READY_FOR_REVIEW"].includes(deliverable.submissionStatus)
    ) {
      response.status(400).json({
        success: false,
        error: { message: "Deliverable has already been submitted" },
      });
      return;
    }

    if (!vendorAction && deliverable.submissionStatus !== "SUBMITTED") {
      response.status(400).json({
        success: false,
        error: { message: "Only submitted deliverables can be reviewed" },
      });
      return;
    }

    const data =
      input.action === "READY_FOR_REVIEW"
        ? { submissionStatus: "READY_FOR_REVIEW" as const, approvalStatus: "PENDING" as const }
        : input.action === "SUBMIT"
          ? { submissionStatus: "SUBMITTED" as const, approvalStatus: "PENDING" as const }
          : input.action === "APPROVE"
            ? {
                approvalStatus: "APPROVED" as const,
                clientFeedback: input.clientFeedback ?? deliverable.clientFeedback,
              }
            : {
                approvalStatus: "CHANGES_REQUESTED" as const,
                clientFeedback: input.clientFeedback,
              };

    const updatedDeliverable = await prisma.deliverable.update({
      where: { id: deliverable.id },
      data,
    });

    response.json({
      success: true,
      data: updatedDeliverable,
    });
  } catch (error) {
    next(error);
  }
});
