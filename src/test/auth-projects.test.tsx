import { QueryClient } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  type AnyRouter,
} from "@tanstack/react-router";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authStore } from "@/lib/auth";
import { storeToken } from "@/lib/session";
import { routeTree } from "@/routeTree.gen";

const clientUser = {
  id: "u-ava",
  name: "Ava Chen",
  email: "client@example.com",
  role: "CLIENT",
  organisationName: "Northwind Retail",
} as const;

const vendorUser = {
  id: "u-jamal",
  name: "Jamal Osei",
  email: "vendor@example.com",
  role: "VENDOR",
  organisationName: "Axiom Consulting",
} as const;

const apiProject = {
  id: "prj-api",
  name: "API Project Alpha",
  description: "A project loaded from the backend.",
  status: "ON_TRACK",
  health: "GOOD",
  completionPercentage: 55,
  startDate: "2026-01-01T00:00:00.000Z",
  endDate: "2026-12-01T00:00:00.000Z",
  clientName: "Northwind Retail",
  vendorName: "Axiom Consulting",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const apiProjectDetail = {
  ...apiProject,
  name: "API Delivery Project",
  description: "Backend project overview content.",
  milestones: [
    {
      id: "ms-api",
      projectId: "prj-api",
      name: "API Milestone",
      description: "Milestone loaded from the API.",
      dueDate: "2026-08-01T00:00:00.000Z",
      status: "IN_PROGRESS",
      progress: 50,
      ownerName: "Jamal Osei",
    },
  ],
  tasks: [
    {
      id: "task-api",
      projectId: "prj-api",
      milestoneId: "ms-api",
      title: "API Task",
      description: "Task loaded from the API.",
      assignedTo: "Jamal Osei",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: "2026-07-15T00:00:00.000Z",
    },
  ],
  deliverables: [
    {
      id: "deliverable-api",
      projectId: "prj-api",
      title: "API Deliverable",
      description: "Deliverable loaded from the API.",
      dueDate: "2026-09-01T00:00:00.000Z",
      submissionStatus: "SUBMITTED",
      approvalStatus: "APPROVED",
      clientFeedback: null,
    },
  ],
  clientRequests: [
    {
      id: "request-api",
      projectId: "prj-api",
      title: "API Client Request",
      description: "Request loaded from the API.",
      priority: "MEDIUM",
      status: "OPEN",
      dueDate: "2026-10-01T00:00:00.000Z",
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
  ],
};

const clientDashboard = {
  role: "CLIENT",
  metrics: {
    totalProjects: 1,
    activeProjects: 1,
    delayedProjects: 0,
    pendingDeliverableApprovals: 0,
  },
  projects: [apiProject],
  upcomingMilestones: [],
  latestDocuments: [],
};

const vendorDashboard = {
  role: "VENDOR",
  metrics: {
    activeProjects: 1,
    tasksDueSoon: 0,
    overdueTasks: 1,
    deliverablesAwaitingReview: 0,
  },
  projects: [apiProject],
  upcomingMilestones: [],
  latestDocuments: [],
};

type MockResult = {
  status?: number;
  body: unknown;
};

function mockApi(routes: Record<string, MockResult>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
      const result = routes[key];

      if (!result) throw new Error(`Unexpected API request: ${key}`);

      return new Response(JSON.stringify(result.body), {
        status: result.status ?? 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
}

async function renderRoute(path: string): Promise<AnyRouter> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

function fillLogin(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Work email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

beforeEach(() => {
  authStore.reset();
});

describe("authentication and project integration", () => {
  it("redirects a valid client login to the client dashboard", async () => {
    mockApi({
      "POST /api/auth/login": {
        body: { success: true, data: { token: "client-token", user: clientUser } },
      },
      "GET /api/dashboard": {
        body: { success: true, data: clientDashboard },
      },
    });
    await renderRoute("/login");

    fillLogin("client@example.com", "password123");

    expect(await screen.findByRole("heading", { name: "Welcome back, Ava" })).toBeTruthy();
  });

  it("redirects a valid vendor login to the vendor dashboard", async () => {
    mockApi({
      "POST /api/auth/login": {
        body: { success: true, data: { token: "vendor-token", user: vendorUser } },
      },
      "GET /api/dashboard": {
        body: { success: true, data: vendorDashboard },
      },
    });
    await renderRoute("/login");

    fillLogin("vendor@example.com", "password123");

    expect(await screen.findByRole("heading", { name: "Welcome back, Jamal" })).toBeTruthy();
  });

  it("shows an understandable error for invalid credentials", async () => {
    mockApi({
      "POST /api/auth/login": {
        status: 401,
        body: {
          success: false,
          error: { message: "Invalid email or password" },
        },
      },
    });
    await renderRoute("/login");

    fillLogin("client@example.com", "incorrect");

    expect((await screen.findByRole("alert")).textContent).toContain("Invalid email or password");
  });

  it("redirects an unauthenticated protected route to login", async () => {
    await renderRoute("/client/dashboard");

    expect(await screen.findByRole("heading", { name: "Sign in to Projectline" })).toBeTruthy();
  });

  it("redirects a client away from the vendor portal", async () => {
    storeToken("client-token");
    mockApi({
      "GET /api/auth/me": {
        body: { success: true, data: clientUser },
      },
      "GET /api/dashboard": {
        body: { success: true, data: clientDashboard },
      },
    });

    await renderRoute("/vendor/dashboard");

    expect(await screen.findByRole("heading", { name: "Welcome back, Ava" })).toBeTruthy();
  });

  it("redirects a vendor away from the client portal", async () => {
    storeToken("vendor-token");
    mockApi({
      "GET /api/auth/me": {
        body: { success: true, data: vendorUser },
      },
      "GET /api/dashboard": {
        body: { success: true, data: vendorDashboard },
      },
    });

    await renderRoute("/client/dashboard");

    expect(await screen.findByRole("heading", { name: "Welcome back, Jamal" })).toBeTruthy();
  });

  it("renders project-list data returned by the backend", async () => {
    storeToken("client-token");
    mockApi({
      "GET /api/auth/me": {
        body: { success: true, data: clientUser },
      },
      "GET /api/projects": {
        body: { success: true, data: [apiProject] },
      },
    });

    await renderRoute("/client/projects");

    expect(await screen.findByText("API Project Alpha")).toBeTruthy();
    expect(screen.queryByText("ERP Data Migration")).toBeNull();
  });

  it("renders project-detail data returned by the backend", async () => {
    storeToken("vendor-token");
    mockApi({
      "GET /api/auth/me": {
        body: { success: true, data: vendorUser },
      },
      "GET /api/projects/prj-api": {
        body: { success: true, data: apiProjectDetail },
      },
    });

    await renderRoute("/vendor/projects/prj-api");

    expect(await screen.findByRole("heading", { name: "API Delivery Project" })).toBeTruthy();
    expect(
      (await screen.findAllByText("Backend project overview content.")).length,
    ).toBeGreaterThan(0);
  });
});
