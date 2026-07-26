import { Router } from "express";

import { prisma } from "../db/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({
      success: true,
      data: {
        status: "ok",
        database: "connected",
      },
    });
  } catch (error) {
    next(error);
  }
});
