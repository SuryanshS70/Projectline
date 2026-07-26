import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(1).default("development-only-secret"),
  UPLOAD_DIRECTORY: z.string().min(1).default("uploads"),
});

export const env = envSchema.parse(process.env);

process.env.DATABASE_URL ??= env.DATABASE_URL;
