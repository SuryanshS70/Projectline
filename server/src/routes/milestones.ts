import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

const paramsSchema = z.object({
  milestoneId: z.string().min(1),
});

const updateMilestoneSchema = z
  .object({
    progress: z.number().int().min(0).max(100).optional(),
    status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "DELAYED"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one milestone field is required",
  });

export const milestonesRouter = Router();

milestonesRouter.use(authenticate);

milestonesRouter.patch("/:milestoneId", async (request, response, next) => {
  try {
    const { milestoneId } = paramsSchema.parse(request.params);
    const update = updateMilestoneSchema.parse(request.body);
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        project: {
          members: {
            some: { userId: request.user!.id },
          },
        },
      },
    });

    if (!milestone) {
      response.status(404).json({
        success: false,
        error: { message: "Milestone not found" },
      });
      return;
    }

    if (request.user!.role !== "VENDOR") {
      response.status(403).json({
        success: false,
        error: { message: "Only vendor users may update milestones" },
      });
      return;
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestone.id },
      data: update,
    });

    response.json({
      success: true,
      data: updatedMilestone,
    });
  } catch (error) {
    next(error);
  }
});
