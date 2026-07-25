import type { ClientRequest } from "./types";

export const clientRequests: ClientRequest[] = [
  {
    id: "cr-1",
    projectId: "prj-portal",
    title: "Add SSO for pilot cohort",
    description: "Enable Okta SSO for beta users so we can skip password reset flows.",
    priority: "high",
    requestedAt: "2026-06-05T09:00:00Z",
    dueDate: "2026-07-15",
    status: "in_progress",
    milestoneId: "ms-p4",
    requesterId: "u-ava",
  },
  {
    id: "cr-2",
    projectId: "prj-portal",
    title: "Marketing preview environment",
    description: "Standalone environment for the marketing team to record walkthroughs.",
    priority: "medium",
    requestedAt: "2026-06-10T14:00:00Z",
    dueDate: "2026-07-01",
    status: "open",
    requesterId: "u-marcus",
  },
  {
    id: "cr-3",
    projectId: "prj-mobile",
    title: "Add barcode batch mode",
    description: "Allow technicians to scan several items in sequence before syncing.",
    priority: "high",
    requestedAt: "2026-06-11T09:00:00Z",
    dueDate: "2026-07-20",
    status: "open",
    milestoneId: "ms-m3",
    requesterId: "u-lena",
  },
  {
    id: "cr-4",
    projectId: "prj-erp",
    title: "Custom reconciliation view for auditors",
    description: "Read-only export of dry-run comparisons.",
    priority: "medium",
    requestedAt: "2026-05-28T10:00:00Z",
    dueDate: "2026-08-10",
    status: "resolved",
    requesterId: "u-marcus",
  },
  {
    id: "cr-5",
    projectId: "prj-cloud",
    title: "Additional observability alert rules",
    description: "Alerts for cost spikes over 15% week-on-week.",
    priority: "low",
    requestedAt: "2026-06-08T11:00:00Z",
    dueDate: "2026-06-30",
    status: "in_progress",
    requesterId: "u-lena",
  },
];

export const requestsForProject = (projectId: string) =>
  clientRequests.filter((r) => r.projectId === projectId);
