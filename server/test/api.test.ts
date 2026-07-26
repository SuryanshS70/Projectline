import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

import { app } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

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

  it("returns the seeded projects", async () => {
    const response = await request(app).get("/api/projects").expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(4);
  });

  it("returns 404 for an unknown project", async () => {
    const response = await request(app).get("/api/projects/missing-project").expect(404);

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "Project not found",
      },
    });
  });

  it("returns 404 for an unknown API route", async () => {
    const response = await request(app).get("/api/not-a-route").expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toContain("Route not found");
  });
});
