import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

const paramsSchema = z.object({
  taskId: z.string().min(1),
});

const updateTaskSchema = z
  .object({
    status: z.enum(["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "COMPLETED"]).optional(),
    assignedTo: z.string().trim().min(1).max(120).optional(),
    dueDate: z.coerce.date().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one task field is required",
  });

export const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.patch("/:taskId", async (request, response, next) => {
  try {
    const { taskId } = paramsSchema.parse(request.params);
    const update = updateTaskSchema.parse(request.body);
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          members: {
            some: { userId: request.user!.id },
          },
        },
      },
    });

    if (!task) {
      response.status(404).json({
        success: false,
        error: { message: "Task not found" },
      });
      return;
    }

    if (request.user!.role !== "VENDOR") {
      response.status(403).json({
        success: false,
        error: { message: "Only vendor users may update tasks" },
      });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: update,
    });

    response.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
});
