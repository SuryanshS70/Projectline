import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { authRouter } from "./routes/auth.js";
import { clientRequestsRouter, projectClientRequestsRouter } from "./routes/client-requests.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { deliverablesRouter } from "./routes/deliverables.js";
import { documentsRouter, projectDocumentsRouter } from "./routes/documents.js";
import { healthRouter } from "./routes/health.js";
import { milestonesRouter } from "./routes/milestones.js";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter } from "./routes/tasks.js";

export const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
);
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/milestones", milestonesRouter);
app.use("/api/deliverables", deliverablesRouter);
app.use("/api/client-requests", clientRequestsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/projects", projectClientRequestsRouter);
app.use("/api/projects", projectDocumentsRouter);
app.use("/api/projects", projectsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
