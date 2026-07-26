import type {
  DeliverableStatus,
  MilestoneStatus,
  ProjectStatus,
  RequestStatus,
  TaskPriority,
  TaskStatus,
} from "@/data/types";
import { getStoredToken } from "@/lib/session";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

interface ApiResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "VENDOR";
  organisationName: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export interface ApiProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  health: "good" | "warning" | "critical";
  completionPercentage: number;
  startDate: string;
  endDate: string;
  clientName: string;
  vendorName: string;
}

export interface ApiMilestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  progress: number;
  ownerName: string;
}

export interface ApiTask {
  id: string;
  projectId: string;
  milestoneId?: string | null;
  title: string;
  description: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

export interface ApiDeliverable {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  submissionStatus: "not_submitted" | "ready_for_review" | "submitted";
  approvalStatus: DeliverableStatus | "pending";
  clientFeedback?: string | null;
}

export interface ApiClientRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: RequestStatus;
  dueDate: string;
  createdAt: string;
}

export interface ApiProjectDetail extends ApiProject {
  milestones: ApiMilestone[];
  tasks: ApiTask[];
  deliverables: ApiDeliverable[];
  clientRequests: ApiClientRequest[];
}

export interface ApiDocument {
  id: string;
  projectId: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
}

export interface ApiDashboard {
  role: "CLIENT" | "VENDOR";
  metrics: {
    totalProjects?: number;
    activeProjects: number;
    delayedProjects?: number;
    pendingDeliverableApprovals?: number;
    tasksDueSoon?: number;
    overdueTasks?: number;
    deliverablesAwaitingReview?: number;
  };
  projects: ApiProject[];
  upcomingMilestones: ApiMilestone[];
  latestDocuments: ApiDocument[];
}

interface RawProject extends Omit<ApiProject, "status" | "health"> {
  status: string;
  health: string;
}

interface RawProjectDetail extends RawProject {
  milestones: Array<Omit<ApiMilestone, "status"> & { status: string }>;
  tasks: Array<Omit<ApiTask, "priority" | "status"> & { priority: string; status: string }>;
  deliverables: Array<
    Omit<ApiDeliverable, "submissionStatus" | "approvalStatus"> & {
      submissionStatus: string;
      approvalStatus: string;
    }
  >;
  clientRequests: Array<
    Omit<ApiClientRequest, "priority" | "status"> & { priority: string; status: string }
  >;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let unauthorizedHandler: (() => void) | undefined;

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !(typeof FormData !== "undefined" && options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError("Unable to reach the Projectline API", 0);
  }

  const body = (await response.json().catch(() => null)) as
    ApiResponse<T> | ApiErrorResponse | null;

  if (!response.ok || !body || !body.success) {
    if (response.status === 401 && authenticated) unauthorizedHandler?.();
    const message =
      body && !body.success ? body.error.message : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return body.data;
}

function lower<T extends string>(value: string): T {
  return value.toLowerCase() as T;
}

function mapProject(project: RawProject): ApiProject {
  return {
    ...project,
    status: lower<ProjectStatus>(project.status),
    health: lower<ApiProject["health"]>(project.health),
  };
}

function mapProjectDetail(project: RawProjectDetail): ApiProjectDetail {
  return {
    ...mapProject(project),
    milestones: project.milestones.map((milestone) => ({
      ...milestone,
      status: lower<MilestoneStatus>(milestone.status),
    })),
    tasks: project.tasks.map((task) => ({
      ...task,
      priority: lower<TaskPriority>(task.priority),
      status: lower<TaskStatus>(task.status),
    })),
    deliverables: project.deliverables.map((deliverable) => ({
      ...deliverable,
      submissionStatus: lower<ApiDeliverable["submissionStatus"]>(deliverable.submissionStatus),
      approvalStatus: lower<DeliverableStatus>(deliverable.approvalStatus),
    })),
    clientRequests: project.clientRequests.map((clientRequest) => ({
      ...clientRequest,
      priority: lower<TaskPriority>(clientRequest.priority),
      status: lower<RequestStatus>(clientRequest.status),
    })),
  };
}

function mapTask(
  task: Omit<ApiTask, "priority" | "status"> & { priority: string; status: string },
): ApiTask {
  return {
    ...task,
    priority: lower<TaskPriority>(task.priority),
    status: lower<TaskStatus>(task.status),
  };
}

function mapMilestone(milestone: Omit<ApiMilestone, "status"> & { status: string }): ApiMilestone {
  return {
    ...milestone,
    status: lower<MilestoneStatus>(milestone.status),
  };
}

function mapDeliverable(
  deliverable: Omit<ApiDeliverable, "submissionStatus" | "approvalStatus"> & {
    submissionStatus: string;
    approvalStatus: string;
  },
): ApiDeliverable {
  return {
    ...deliverable,
    submissionStatus: lower<ApiDeliverable["submissionStatus"]>(deliverable.submissionStatus),
    approvalStatus: lower<ApiDeliverable["approvalStatus"]>(deliverable.approvalStatus),
  };
}

function mapClientRequest(
  clientRequest: Omit<ApiClientRequest, "priority" | "status"> & {
    priority: string;
    status: string;
  },
): ApiClientRequest {
  return {
    ...clientRequest,
    priority: lower<TaskPriority>(clientRequest.priority),
    status: lower<RequestStatus>(clientRequest.status),
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  return request<LoginResult>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    false,
  );
}

export async function getCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/me");
}

export async function logout(): Promise<void> {
  await request<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export async function getProjects(): Promise<ApiProject[]> {
  const projects = await request<RawProject[]>("/api/projects");
  return projects.map(mapProject);
}

export async function getProject(projectId: string): Promise<ApiProjectDetail> {
  const project = await request<RawProjectDetail>(`/api/projects/${encodeURIComponent(projectId)}`);
  return mapProjectDetail(project);
}

export async function updateTask(
  taskId: string,
  update: {
    status?: TaskStatus;
    assignedTo?: string;
    dueDate?: string;
  },
): Promise<ApiTask> {
  const task = await request<
    Omit<ApiTask, "priority" | "status"> & { priority: string; status: string }
  >(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...update,
      status: update.status?.toUpperCase(),
    }),
  });
  return mapTask(task);
}

export async function updateMilestone(
  milestoneId: string,
  update: {
    progress?: number;
    status?: MilestoneStatus;
  },
): Promise<ApiMilestone> {
  const milestone = await request<Omit<ApiMilestone, "status"> & { status: string }>(
    `/api/milestones/${encodeURIComponent(milestoneId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...update,
        status: update.status?.toUpperCase(),
      }),
    },
  );
  return mapMilestone(milestone);
}

export type DeliverableAction = "READY_FOR_REVIEW" | "SUBMIT" | "APPROVE" | "REQUEST_CHANGES";

export async function updateDeliverable(
  deliverableId: string,
  action: DeliverableAction,
  clientFeedback?: string,
): Promise<ApiDeliverable> {
  const deliverable = await request<
    Omit<ApiDeliverable, "submissionStatus" | "approvalStatus"> & {
      submissionStatus: string;
      approvalStatus: string;
    }
  >(`/api/deliverables/${encodeURIComponent(deliverableId)}`, {
    method: "PATCH",
    body: JSON.stringify({ action, clientFeedback }),
  });
  return mapDeliverable(deliverable);
}

export async function getClientRequests(projectId: string): Promise<ApiClientRequest[]> {
  const clientRequests = await request<
    Array<Omit<ApiClientRequest, "priority" | "status"> & { priority: string; status: string }>
  >(`/api/projects/${encodeURIComponent(projectId)}/client-requests`);
  return clientRequests.map(mapClientRequest);
}

export async function createClientRequest(
  projectId: string,
  input: {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string;
  },
): Promise<ApiClientRequest> {
  const clientRequest = await request<
    Omit<ApiClientRequest, "priority" | "status"> & { priority: string; status: string }
  >(`/api/projects/${encodeURIComponent(projectId)}/client-requests`, {
    method: "POST",
    body: JSON.stringify({
      ...input,
      priority: input.priority.toUpperCase(),
    }),
  });
  return mapClientRequest(clientRequest);
}

export async function updateClientRequest(
  requestId: string,
  status: RequestStatus,
): Promise<ApiClientRequest> {
  const clientRequest = await request<
    Omit<ApiClientRequest, "priority" | "status"> & { priority: string; status: string }
  >(`/api/client-requests/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: status.toUpperCase() }),
  });
  return mapClientRequest(clientRequest);
}

export async function getDocuments(projectId: string): Promise<ApiDocument[]> {
  return request<ApiDocument[]>(`/api/projects/${encodeURIComponent(projectId)}/documents`);
}

export async function uploadDocument(projectId: string, file: File): Promise<ApiDocument> {
  const body = new FormData();
  body.append("file", file);
  return request<ApiDocument>(`/api/projects/${encodeURIComponent(projectId)}/documents`, {
    method: "POST",
    body,
  });
}

export async function downloadDocument(documentId: string): Promise<Blob> {
  const headers = new Headers({ Accept: "*/*" });
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/documents/${encodeURIComponent(documentId)}/download`, {
      headers,
    });
  } catch {
    throw new ApiError("Unable to reach the Projectline API", 0);
  }

  if (!response.ok) {
    if (response.status === 401) unauthorizedHandler?.();
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(
      body && !body.success ? body.error.message : "Unable to download document",
      response.status,
    );
  }

  return response.blob();
}

export async function deleteDocument(documentId: string): Promise<void> {
  await request<{ id: string }>(`/api/documents/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  });
}

export async function getDashboard(): Promise<ApiDashboard> {
  const dashboard = await request<
    Omit<ApiDashboard, "projects" | "upcomingMilestones"> & {
      projects: RawProject[];
      upcomingMilestones: Array<Omit<ApiMilestone, "status"> & { status: string }>;
    }
  >("/api/dashboard");

  return {
    ...dashboard,
    projects: dashboard.projects.map(mapProject),
    upcomingMilestones: dashboard.upcomingMilestones.map(mapMilestone),
  };
}
