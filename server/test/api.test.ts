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

afterAll(async () => {
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
    expect(response.body.data.deliverables).toHaveLength(2);
    expect(response.body.data.clientRequests).toHaveLength(2);
  });

  it("returns 404 for an unknown API route", async () => {
    const response = await request(app).get("/api/not-a-route").expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toContain("Route not found");
  });
});
