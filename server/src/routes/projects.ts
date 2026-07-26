import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

const projectParamsSchema = z.object({
  projectId: z.string().min(1),
});

export const projectsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.get("/", async (request, response, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: request.user!.id,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    response.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:projectId", async (request, response, next) => {
  try {
    const { projectId } = projectParamsSchema.parse(request.params);
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: request.user!.id,
          },
        },
      },
      include: {
        milestones: true,
        tasks: true,
        deliverables: true,
        clientRequests: true,
      },
    });

    if (!project) {
      response.status(404).json({
        success: false,
        error: {
          message: "Project not found",
        },
      });
      return;
    }

    response.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});
