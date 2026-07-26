import { randomUUID } from "node:crypto";
import { access, unlink } from "node:fs/promises";

import { Router, type RequestHandler } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { isSafeUploadedFilePath, uploadSingleDocument } from "../uploads.js";

const projectParamsSchema = z.object({
  projectId: z.string().min(1),
});

const documentParamsSchema = z.object({
  documentId: z.string().min(1),
});

const documentSelect = {
  id: true,
  projectId: true,
  originalName: true,
  mimeType: true,
  fileSize: true,
  createdAt: true,
  uploadedBy: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const requireProjectMembership: RequestHandler = async (request, response, next) => {
  try {
    const { projectId } = projectParamsSchema.parse(request.params);
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: request.user!.id,
          projectId,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      response.status(404).json({
        success: false,
        error: { message: "Project not found" },
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const projectDocumentsRouter = Router();
export const documentsRouter = Router();

projectDocumentsRouter.use(authenticate);
documentsRouter.use(authenticate);

projectDocumentsRouter.get(
  "/:projectId/documents",
  requireProjectMembership,
  async (request, response, next) => {
    try {
      const { projectId } = projectParamsSchema.parse(request.params);
      const documents = await prisma.document.findMany({
        where: { projectId },
        select: documentSelect,
        orderBy: { createdAt: "desc" },
      });

      response.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  },
);

projectDocumentsRouter.post(
  "/:projectId/documents",
  requireProjectMembership,
  uploadSingleDocument,
  async (request, response, next) => {
    if (!request.file) {
      response.status(400).json({
        success: false,
        error: { message: "A document file is required" },
      });
      return;
    }

    try {
      const { projectId } = projectParamsSchema.parse(request.params);
      const document = await prisma.document.create({
        data: {
          id: randomUUID(),
          projectId,
          fileName: request.file.filename,
          originalName: request.file.originalname,
          mimeType: request.file.mimetype,
          fileSize: request.file.size,
          filePath: request.file.path,
          uploadedById: request.user!.id,
        },
        select: documentSelect,
      });

      response.status(201).json({
        success: true,
        data: document,
      });
    } catch (error) {
      await unlink(request.file.path).catch(() => undefined);
      next(error);
    }
  },
);

documentsRouter.get("/:documentId/download", async (request, response, next) => {
  try {
    const { documentId } = documentParamsSchema.parse(request.params);
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        project: {
          members: {
            some: { userId: request.user!.id },
          },
        },
      },
    });

    if (!document || !isSafeUploadedFilePath(document.filePath)) {
      response.status(404).json({
        success: false,
        error: { message: "Document not found" },
      });
      return;
    }

    await access(document.filePath);
    response.download(document.filePath, document.originalName, (error) => {
      if (error && !response.headersSent) next(error);
    });
  } catch (error) {
    next(error);
  }
});

documentsRouter.delete("/:documentId", async (request, response, next) => {
  try {
    const { documentId } = documentParamsSchema.parse(request.params);
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        project: {
          members: {
            some: { userId: request.user!.id },
          },
        },
      },
    });

    if (!document || !isSafeUploadedFilePath(document.filePath)) {
      response.status(404).json({
        success: false,
        error: { message: "Document not found" },
      });
      return;
    }

    await unlink(document.filePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
    await prisma.document.delete({ where: { id: document.id } });

    response.json({
      success: true,
      data: {
        id: document.id,
      },
    });
  } catch (error) {
    next(error);
  }
});
