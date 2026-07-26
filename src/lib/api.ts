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
  submissionStatus: "not_submitted" | "submitted";
  approvalStatus: DeliverableStatus;
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

  if (options.body) {
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
