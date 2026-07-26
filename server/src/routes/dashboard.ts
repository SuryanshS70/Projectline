import { Router } from "express";

import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get("/", async (request, response, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId: request.user!.id },
        },
      },
      include: {
        milestones: true,
        tasks: true,
        deliverables: true,
        documents: {
          include: {
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const now = new Date();
    const dueSoon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tasks = projects.flatMap((project) => project.tasks);
    const deliverables = projects.flatMap((project) => project.deliverables);
    const milestones = projects
      .flatMap((project) => project.milestones)
      .filter((milestone) => milestone.status !== "COMPLETED")
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 4);
    const documents = projects
      .flatMap((project) =>
        project.documents.map((document) => ({
          id: document.id,
          projectId: document.projectId,
          originalName: document.originalName,
          mimeType: document.mimeType,
          fileSize: document.fileSize,
          createdAt: document.createdAt,
          uploadedBy: document.uploadedBy,
        })),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4);

    const projectSummaries = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      health: project.health,
      completionPercentage: project.completionPercentage,
      startDate: project.startDate,
      endDate: project.endDate,
      clientName: project.clientName,
      vendorName: project.vendorName,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    const metrics =
      request.user!.role === "CLIENT"
        ? {
            totalProjects: projects.length,
            activeProjects: projects.filter((project) => project.status !== "COMPLETED").length,
            delayedProjects: projects.filter((project) =>
              ["DELAYED", "AT_RISK"].includes(project.status),
            ).length,
            pendingDeliverableApprovals: deliverables.filter(
              (deliverable) =>
                deliverable.submissionStatus === "SUBMITTED" &&
                ["PENDING", "SUBMITTED"].includes(deliverable.approvalStatus),
            ).length,
          }
        : {
            activeProjects: projects.filter((project) => project.status !== "COMPLETED").length,
            tasksDueSoon: tasks.filter(
              (task) =>
                task.status !== "COMPLETED" && task.dueDate >= now && task.dueDate <= dueSoon,
            ).length,
            overdueTasks: tasks.filter((task) => task.status !== "COMPLETED" && task.dueDate < now)
              .length,
            deliverablesAwaitingReview: deliverables.filter(
              (deliverable) =>
                deliverable.submissionStatus === "SUBMITTED" &&
                ["PENDING", "SUBMITTED"].includes(deliverable.approvalStatus),
            ).length,
          };

    response.json({
      success: true,
      data: {
        role: request.user!.role,
        metrics,
        projects: projectSummaries,
        upcomingMilestones: milestones,
        latestDocuments: documents,
      },
    });
  } catch (error) {
    next(error);
  }
});
