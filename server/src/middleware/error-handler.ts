import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      error: {
        message: "Invalid request data",
        issues: error.issues,
      },
    });
    return;
  }

  if (env.NODE_ENV !== "test") {
    console.error(error);
  }

  response.status(500).json({
    success: false,
    error: {
      message: "Unexpected server error",
    },
  });
};
