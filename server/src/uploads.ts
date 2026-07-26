import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

import multer from "multer";

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
export const uploadDirectory = path.resolve(process.cwd(), "uploads");

const allowedExtensions = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".txt",
  ".zip",
]);

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
]);

export class UnsupportedDocumentTypeError extends Error {
  constructor() {
    super("Unsupported file type");
    this.name = "UnsupportedDocumentTypeError";
  }
}

mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});

export const uploadSingleDocument = multer({
  storage,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      callback(new UnsupportedDocumentTypeError());
      return;
    }
    callback(null, true);
  },
}).single("file");

export function isSafeUploadedFilePath(filePath: string): boolean {
  const relative = path.relative(uploadDirectory, path.resolve(filePath));
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}
