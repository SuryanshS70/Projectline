import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  type AnyRouter,
} from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UploadZone } from "@/components/common/UploadZone";
import { ClientRequestsList } from "@/components/project/ClientRequestsList";
import { DeliverablesList } from "@/components/project/DeliverablesList";
import { TasksBoard } from "@/components/project/TasksBoard";
import type { ApiProjectDetail } from "@/lib/api";
import { storeToken } from "@/lib/session";
import { routeTree } from "@/routeTree.gen";

const clientUser = {
  id: "u-ava",
  name: "Ava Chen",
  email: "client@example.com",
  role: "CLIENT",
  organisationName: "Northwind Retail",
} as const;

const rawProject = {
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

const project: ApiProjectDetail = {
  ...rawProject,
  status: "on_track",
  health: "good",
  milestones: [],
  tasks: [],
  deliverables: [
    {
      id: "d-test",
      projectId: "prj-api",
      title: "Beta package",
      description: "A package ready to submit.",
      dueDate: "2026-09-01T00:00:00.000Z",
      submissionStatus: "not_submitted",
      approvalStatus: "not_started",
      clientFeedback: null,
    },
  ],
  clientRequests: [],
};

function withQueryClient(component: React.ReactNode, queryClient = new QueryClient()) {
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
}

function mockJsonApi(handler: (path: string, init?: RequestInit) => unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      return new Response(JSON.stringify(handler(new URL(url).pathname, init)), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
}

async function renderRoute(path: string): Promise<AnyRouter> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
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

function DeliverableHarness() {
  const { data } = useQuery({
    queryKey: ["project", "test", project.id],
    queryFn: async () => project,
    initialData: project,
  });
  return <DeliverablesList items={data.deliverables} role="vendor" />;
}

function ClientRequestHarness() {
  const { data } = useQuery({
    queryKey: ["project", "test", project.id],
    queryFn: async () => project,
    initialData: project,
  });
  return <ClientRequestsList projectId={project.id} items={data.clientRequests} role="client" />;
}

describe("Phase 4 frontend integration", () => {
  it("calls the task API when a vendor changes task status", async () => {
    storeToken("vendor-token");
    mockJsonApi((_path, init) => ({
      success: true,
      data: {
        id: "t-test",
        projectId: "prj-api",
        milestoneId: null,
        title: "API task",
        description: "Task mutation test.",
        assignedTo: "Jamal Osei",
        priority: "HIGH",
        status: JSON.parse(String(init?.body)).status,
        dueDate: "2026-09-01T00:00:00.000Z",
      },
    }));

    withQueryClient(
      <TasksBoard
        items={[
          {
            id: "t-test",
            projectId: "prj-api",
            milestoneId: null,
            title: "API task",
            description: "Task mutation test.",
            assignedTo: "Jamal Osei",
            priority: "high",
            status: "not_started",
            dueDate: "2026-09-01T00:00:00.000Z",
          },
        ]}
        milestones={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Status for API task"), {
      target: { value: "completed" },
    });

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/tasks/t-test",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "COMPLETED" }),
        }),
      ),
    );
  });

  it("updates the deliverable UI after a successful action", async () => {
    storeToken("vendor-token");
    mockJsonApi(() => ({
      success: true,
      data: {
        ...project.deliverables[0],
        submissionStatus: "SUBMITTED",
        approvalStatus: "PENDING",
      },
    }));

    withQueryClient(<DeliverableHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Submit deliverable" }));

    expect(await screen.findByText("Pending")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit deliverable" })).toBeNull();
  });

  it("shows successful document upload state", async () => {
    const upload = vi.fn().mockResolvedValue(undefined);
    withQueryClient(<UploadZone onUpload={upload} />);
    const file = new File(["document"], "phase4.txt", { type: "text/plain" });

    fireEvent.change(screen.getByLabelText("Choose document"), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload file" }));

    expect(await screen.findByText("Uploaded")).toBeTruthy();
    expect(upload).toHaveBeenCalledWith(file);
  });

  it("shows document upload errors", async () => {
    const upload = vi.fn().mockRejectedValue(new Error("Unsupported file type"));
    withQueryClient(<UploadZone onUpload={upload} />);
    const file = new File(["document"], "phase4.exe", {
      type: "application/octet-stream",
    });

    fireEvent.change(screen.getByLabelText("Choose document"), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload file" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Unsupported file type");
  });

  it("creates a client request and renders the returned record", async () => {
    storeToken("client-token");
    mockJsonApi((_path, init) => ({
      success: true,
      data: {
        id: "cr-new",
        projectId: "prj-api",
        ...JSON.parse(String(init?.body)),
        priority: "HIGH",
        status: "OPEN",
        createdAt: "2026-07-26T00:00:00.000Z",
      },
    }));

    withQueryClient(<ClientRequestHarness />);
    fireEvent.change(screen.getByLabelText("Request title"), {
      target: { value: "Add export" },
    });
    fireEvent.change(screen.getByLabelText("Request due date"), {
      target: { value: "2026-09-15" },
    });
    fireEvent.change(screen.getByLabelText("Request description"), {
      target: { value: "Add a simple project export." },
    });
    fireEvent.change(screen.getByLabelText("Request priority"), {
      target: { value: "high" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create request" }));

    expect(await screen.findByText("Add export")).toBeTruthy();
  });

  it("renders client dashboard metrics returned by the API", async () => {
    storeToken("client-token");
    mockJsonApi((path) => {
      if (path === "/api/auth/me") return { success: true, data: clientUser };
      return {
        success: true,
        data: {
          role: "CLIENT",
          metrics: {
            totalProjects: 7,
            activeProjects: 5,
            delayedProjects: 2,
            pendingDeliverableApprovals: 3,
          },
          projects: [rawProject],
          upcomingMilestones: [],
          latestDocuments: [],
        },
      };
    });

    await renderRoute("/client/dashboard");

    expect(await screen.findByText("Total projects")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
    const pendingLabel = screen.getByText("Pending approvals");
    expect(pendingLabel).toBeTruthy();
    expect(within(pendingLabel.closest(".rounded-xl")!).getByText("3")).toBeTruthy();
  });
});
