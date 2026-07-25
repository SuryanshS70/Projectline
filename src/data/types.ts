// Domain types for the PM dashboard. All data is mock; these interfaces are
// the contract Codex should preserve when wiring the backend.

export type Role = "client" | "vendor";

export type OrganisationType = "client" | "vendor";

export interface Organisation {
  id: string;
  name: string;
  type: OrganisationType;
  industry: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organisationId: string;
  title: string;
  avatarUrl?: string;
}

export type ProjectStatus = "on_track" | "at_risk" | "delayed" | "completed" | "on_hold";

export type RiskLevel = "low" | "medium" | "high";

export interface Project {
  id: string;
  name: string;
  description: string;
  clientOrgId: string;
  vendorOrgId: string;
  status: ProjectStatus;
  completion: number; // 0-100
  startDate: string; // ISO
  expectedEndDate: string; // ISO
  projectManagerId: string; // vendor PM
  clientContactId: string;
  nextMilestone: string;
  currentPhase: string;
  risk: RiskLevel;
  budget: string;
  health: "good" | "warning" | "critical";
  notes: string;
}

export type MilestoneStatus = "not_started" | "in_progress" | "completed" | "delayed";

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  dueDate: string;
  status: MilestoneStatus;
  ownerId: string;
  progress: number;
  dependencies: string[]; // milestone ids
}

export type TaskStatus = "not_started" | "in_progress" | "blocked" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
}

export type DeliverableStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "approved"
  | "changes_requested";

export interface Deliverable {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  submissionStatus: "not_submitted" | "submitted";
  approvalStatus: DeliverableStatus;
  version: number;
  feedback?: string;
}

export type DocumentType = "pdf" | "docx" | "xlsx" | "png" | "zip" | "pptx";
export type DocumentApproval = "pending" | "approved" | "rejected" | "not_required";
export type DocumentVisibility = "internal" | "client_visible";

export interface DocumentRecord {
  id: string;
  projectId: string;
  name: string;
  type: DocumentType;
  sizeBytes: number;
  uploadedById: string;
  uploadedAt: string;
  version: number;
  category: string;
  approval: DocumentApproval;
  visibility: DocumentVisibility;
  description?: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  body: string;
  authorId: string;
  createdAt: string;
  status: "info" | "milestone" | "risk" | "resolved";
  hasAttachment: boolean;
}

export type ActivityKind =
  | "document_uploaded"
  | "milestone_completed"
  | "deliverable_approved"
  | "deliverable_submitted"
  | "due_date_changed"
  | "comment_added"
  | "task_status_changed"
  | "request_submitted";

export interface ActivityEntry {
  id: string;
  projectId: string;
  kind: ActivityKind;
  actorId: string;
  summary: string;
  createdAt: string;
}

export type NotificationKind =
  | "approval_request"
  | "new_upload"
  | "deadline"
  | "delayed_milestone"
  | "project_update"
  | "feedback";

export interface NotificationRecord {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  projectId?: string;
  audience: Role;
}

export type RequestStatus = "open" | "in_progress" | "resolved" | "declined";

export interface ClientRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  requestedAt: string;
  dueDate: string;
  status: RequestStatus;
  milestoneId?: string;
  requesterId: string;
}
