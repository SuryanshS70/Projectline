import { randomUUID } from "node:crypto";

import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

const projectParamsSchema = z.object({
  projectId: z.string().min(1),
});

const requestParamsSchema = z.object({
  requestId: z.string().min(1),
});

const createRequestSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(2000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.coerce.date(),
});

const updateRequestSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED"]),
});

async function canAccessProject(userId: string, projectId: string): Promise<boolean> {
  return Boolean(
    await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
      select: { id: true },
    }),
  );
}

export const projectClientRequestsRouter = Router();
export const clientRequestsRouter = Router();

projectClientRequestsRouter.use(authenticate);
clientRequestsRouter.use(authenticate);

projectClientRequestsRouter.get("/:projectId/client-requests", async (request, response, next) => {
  try {
    const { projectId } = projectParamsSchema.parse(request.params);
    if (!(await canAccessProject(request.user!.id, projectId))) {
      response.status(404).json({
        success: false,
        error: { message: "Project not found" },
      });
      return;
    }

    const clientRequests = await prisma.clientRequest.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    response.json({
      success: true,
      data: clientRequests,
    });
  } catch (error) {
    next(error);
  }
});

projectClientRequestsRouter.post("/:projectId/client-requests", async (request, response, next) => {
  try {
    const { projectId } = projectParamsSchema.parse(request.params);
    const input = createRequestSchema.parse(request.body);
    if (!(await canAccessProject(request.user!.id, projectId))) {
      response.status(404).json({
        success: false,
        error: { message: "Project not found" },
      });
      return;
    }
    if (request.user!.role !== "CLIENT") {
      response.status(403).json({
        success: false,
        error: { message: "Only client users may create requests" },
      });
      return;
    }

    const clientRequest = await prisma.clientRequest.create({
      data: {
        id: randomUUID(),
        projectId,
        ...input,
        status: "OPEN",
      },
    });

    response.status(201).json({
      success: true,
      data: clientRequest,
    });
  } catch (error) {
    next(error);
  }
});

clientRequestsRouter.patch("/:requestId", async (request, response, next) => {
  try {
    const { requestId } = requestParamsSchema.parse(request.params);
    const input = updateRequestSchema.parse(request.body);
    const clientRequest = await prisma.clientRequest.findFirst({
      where: {
        id: requestId,
        project: {
          members: {
            some: { userId: request.user!.id },
          },
        },
      },
    });

    if (!clientRequest) {
      response.status(404).json({
        success: false,
        error: { message: "Client request not found" },
      });
      return;
    }
    if (request.user!.role !== "VENDOR") {
      response.status(403).json({
        success: false,
        error: { message: "Only vendor users may update client requests" },
      });
      return;
    }

    const updatedRequest = await prisma.clientRequest.update({
      where: { id: clientRequest.id },
      data: input,
    });

    response.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
});
