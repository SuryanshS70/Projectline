import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

import { app } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

interface LoginData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "CLIENT" | "VENDOR";
    organisationName: string;
  };
}

async function login(email: string, password = "password123"): Promise<LoginData> {
  const response = await request(app).post("/api/auth/login").send({ email, password }).expect(200);
  return response.body.data as LoginData;
}

let createdRequestId: string | undefined;

afterAll(async () => {
  await prisma.task.update({
    where: { id: "t-1" },
    data: { status: "IN_PROGRESS" },
  });
  await prisma.milestone.update({
    where: { id: "ms-p3" },
    data: { progress: 65, status: "IN_PROGRESS" },
  });
  await prisma.deliverable.update({
    where: { id: "d-2" },
    data: {
      submissionStatus: "NOT_SUBMITTED",
      approvalStatus: "NOT_STARTED",
      clientFeedback: null,
    },
  });
  if (createdRequestId) {
    await prisma.clientRequest.deleteMany({ where: { id: createdRequestId } });
  }
  const testDocuments = await prisma.document.findMany({
    where: { originalName: { startsWith: "phase4-" } },
  });
  await Promise.all(
    testDocuments.map(async (document) => {
      const { unlink } = await import("node:fs/promises");
      await unlink(document.filePath).catch(() => undefined);
    }),
  );
  await prisma.document.deleteMany({
    where: { originalName: { startsWith: "phase4-" } },
  });
  await prisma.$disconnect();
});

describe("Projectline API", () => {
  it("returns a healthy server and database status", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        status: "ok",
        database: "connected",
      },
    });
  });

  it("logs in with correct credentials", async () => {
    const data = await login("client@example.com");

    expect(data.token).toEqual(expect.any(String));
    expect(data.user).toEqual({
      id: "u-ava",
      name: "Ava Chen",
      email: "client@example.com",
      role: "CLIENT",
      organisationName: "Northwind Retail",
    });
    expect(data.user).not.toHaveProperty("passwordHash");
  });

  it("rejects an incorrect password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "client@example.com", password: "wrong-password" })
      .expect(401);

    expect(response.body.error.message).toBe("Invalid email or password");
  });

  it("rejects an unknown email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "unknown@example.com", password: "password123" })
      .expect(401);

    expect(response.body.error.message).toBe("Invalid email or password");
  });

  it("requires authentication for the current-user endpoint", async () => {
    const response = await request(app).get("/api/auth/me").expect(401);
    expect(response.body.error.message).toBe("Authentication required");
  });

  it("returns the current user for a valid token", async () => {
    const { token, user } = await login("vendor@example.com");
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toEqual(user);
    expect(response.body.data).not.toHaveProperty("passwordHash");
  });

  it("rejects an invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token")
      .expect(401);

    expect(response.body.error.message).toBe("Authentication required");
  });

  it("requires authentication for the project list", async () => {
    const response = await request(app).get("/api/projects").expect(401);
    expect(response.body.error.message).toBe("Authentication required");
  });

  it("returns only projects assigned to the client", async () => {
    const { token } = await login("client@example.com");
    const response = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.map((project: { id: string }) => project.id)).toEqual([
      "prj-portal",
      "prj-erp",
    ]);
  });

  it("returns only projects assigned to the vendor", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.map((project: { id: string }) => project.id)).toEqual([
      "prj-portal",
      "prj-mobile",
    ]);
  });

  it("does not expose an unassigned project", async () => {
    const { token } = await login("client@example.com");
    const response = await request(app)
      .get("/api/projects/prj-mobile")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(response.body.error.message).toBe("Project not found");
  });

  it("returns an assigned project with related data", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .get("/api/projects/prj-portal")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.id).toBe("prj-portal");
    expect(response.body.data.milestones).toHaveLength(2);
    expect(response.body.data.tasks).toHaveLength(2);
    expect(response.body.data.deliverables).toHaveLength(3);
    expect(response.body.data.clientRequests).toHaveLength(2);
  });

  it("requires authentication for task updates", async () => {
    const response = await request(app)
      .patch("/api/tasks/t-1")
      .send({ status: "COMPLETED" })
      .expect(401);

    expect(response.body.error.message).toBe("Authentication required");
  });

  it("lets an assigned vendor update a task", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .patch("/api/tasks/t-1")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "BLOCKED" })
      .expect(200);

    expect(response.body.data.status).toBe("BLOCKED");
  });

  it("does not let a vendor update an unassigned task", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .patch("/api/tasks/t-6")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "COMPLETED" })
      .expect(404);

    expect(response.body.error.message).toBe("Task not found");
  });

  it("rejects an invalid task status", async () => {
    const { token } = await login("vendor@example.com");
    await request(app)
      .patch("/api/tasks/t-1")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "INVALID" })
      .expect(400);
  });

  it("requires authentication for milestone updates", async () => {
    await request(app).patch("/api/milestones/ms-p3").send({ progress: 70 }).expect(401);
  });

  it("lets an assigned vendor update milestone progress", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .patch("/api/milestones/ms-p3")
      .set("Authorization", `Bearer ${token}`)
      .send({ progress: 72, status: "IN_PROGRESS" })
      .expect(200);

    expect(response.body.data.progress).toBe(72);
    expect(response.body.data.status).toBe("IN_PROGRESS");
  });

  it("rejects milestone progress over 100", async () => {
    const { token } = await login("vendor@example.com");
    await request(app)
      .patch("/api/milestones/ms-p3")
      .set("Authorization", `Bearer ${token}`)
      .send({ progress: 101 })
      .expect(400);
  });

  it("lets a vendor submit a deliverable", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .patch("/api/deliverables/d-2")
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "SUBMIT" })
      .expect(200);

    expect(response.body.data.submissionStatus).toBe("SUBMITTED");
    expect(response.body.data.approvalStatus).toBe("PENDING");
  });

  it("lets a client approve a submitted deliverable", async () => {
    const { token } = await login("client@example.com");
    const response = await request(app)
      .patch("/api/deliverables/d-2")
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "APPROVE", clientFeedback: "Approved for the pilot." })
      .expect(200);

    expect(response.body.data.approvalStatus).toBe("APPROVED");
    expect(response.body.data.clientFeedback).toBe("Approved for the pilot.");
  });

  it("does not let a vendor approve a deliverable", async () => {
    const { token } = await login("vendor@example.com");
    await request(app)
      .patch("/api/deliverables/d-3")
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "APPROVE" })
      .expect(403);
  });

  it("does not let a client submit a deliverable", async () => {
    const { token } = await login("client@example.com");
    await request(app)
      .patch("/api/deliverables/d-3")
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "SUBMIT" })
      .expect(403);
  });

  it("lets a client create a project request", async () => {
    const { token } = await login("client@example.com");
    const response = await request(app)
      .post("/api/projects/prj-portal/client-requests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Phase 4 test request",
        description: "A request created by the API test suite.",
        priority: "MEDIUM",
        dueDate: "2026-09-01",
      })
      .expect(201);

    createdRequestId = response.body.data.id as string;
    expect(response.body.data.status).toBe("OPEN");
  });

  it("lets a vendor update an assigned client request", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .patch(`/api/client-requests/${createdRequestId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "COMPLETED" })
      .expect(200);

    expect(response.body.data.status).toBe("COMPLETED");
  });

  it("rejects client-request creation for an unassigned project", async () => {
    const { token } = await login("client@example.com");
    await request(app)
      .post("/api/projects/prj-mobile/client-requests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Unassigned request",
        description: "This request must not be created.",
        priority: "LOW",
        dueDate: "2026-09-01",
      })
      .expect(404);
  });

  it("requires authentication for document upload", async () => {
    await request(app)
      .post("/api/projects/prj-mobile/documents")
      .attach("file", Buffer.from("test"), {
        filename: "phase4-auth.txt",
        contentType: "text/plain",
      })
      .expect(401);
  });

  let uploadedDocumentId: string | undefined;

  it("uploads an allowed document for an assigned project", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .post("/api/projects/prj-mobile/documents")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("Projectline Phase 4 document"), {
        filename: "phase4-valid.txt",
        contentType: "text/plain",
      })
      .expect(201);

    uploadedDocumentId = response.body.data.id as string;
    expect(response.body.data.originalName).toBe("phase4-valid.txt");
    expect(response.body.data).not.toHaveProperty("filePath");
    expect(response.body.data.uploadedBy.name).toBe("Jamal Osei");
  });

  it("rejects an unsupported document type", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .post("/api/projects/prj-mobile/documents")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("not allowed"), {
        filename: "phase4-unsupported.exe",
        contentType: "application/octet-stream",
      })
      .expect(415);

    expect(response.body.error.message).toBe("Unsupported file type");
  });

  it("rejects a document over 10 MB", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .post("/api/projects/prj-mobile/documents")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.alloc(10 * 1024 * 1024 + 1), {
        filename: "phase4-too-large.txt",
        contentType: "text/plain",
      })
      .expect(413);

    expect(response.body.error.message).toContain("10 MB");
  });

  it("rejects upload to an unassigned project", async () => {
    const { token } = await login("client@example.com");
    await request(app)
      .post("/api/projects/prj-mobile/documents")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("test"), {
        filename: "phase4-unassigned.txt",
        contentType: "text/plain",
      })
      .expect(404);
  });

  it("requires project access to download a document", async () => {
    const { token } = await login("client@example.com");
    await request(app)
      .get(`/api/documents/${uploadedDocumentId}/download`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  it("downloads a document for an assigned member", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .get(`/api/documents/${uploadedDocumentId}/download`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.headers["content-disposition"]).toContain("phase4-valid.txt");
  });

  it("requires project access to delete a document", async () => {
    const { token } = await login("client@example.com");
    await request(app)
      .delete(`/api/documents/${uploadedDocumentId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  it("deletes a document for an assigned member", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .delete(`/api/documents/${uploadedDocumentId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.id).toBe(uploadedDocumentId);
  });

  it("returns client dashboard metrics from assigned backend data", async () => {
    const { token } = await login("client@example.com");
    const response = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.role).toBe("CLIENT");
    expect(response.body.data.metrics.totalProjects).toBe(2);
    expect(response.body.data.projects.map((project: { id: string }) => project.id)).toEqual([
      "prj-portal",
      "prj-erp",
    ]);
  });

  it("returns vendor dashboard metrics from assigned backend data", async () => {
    const { token } = await login("vendor@example.com");
    const response = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.role).toBe("VENDOR");
    expect(response.body.data.metrics.activeProjects).toBe(2);
    expect(response.body.data.metrics.overdueTasks).toEqual(expect.any(Number));
  });

  it("returns 404 for an unknown API route", async () => {
    const response = await request(app).get("/api/not-a-route").expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toContain("Route not found");
  });
});
