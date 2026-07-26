import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { UnsupportedDocumentTypeError } from "../uploads.js";

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

  if (error instanceof UnsupportedDocumentTypeError) {
    response.status(415).json({
      success: false,
      error: {
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    response.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
      success: false,
      error: {
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "File exceeds the 10 MB upload limit"
            : "Invalid file upload",
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
