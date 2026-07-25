import type { ActivityEntry } from "./types";

export const activity: ActivityEntry[] = [
  {
    id: "a-1",
    projectId: "prj-portal",
    kind: "document_uploaded",
    actorId: "u-tom",
    summary: "uploaded Accessibility_Audit.docx",
    createdAt: "2026-06-14T09:22:00Z",
  },
  {
    id: "a-2",
    projectId: "prj-portal",
    kind: "milestone_completed",
    actorId: "u-tom",
    summary: 'completed milestone "Design system & prototypes"',
    createdAt: "2026-05-15T18:00:00Z",
  },
  {
    id: "a-3",
    projectId: "prj-portal",
    kind: "deliverable_submitted",
    actorId: "u-priya",
    summary: 'submitted deliverable "Accessibility audit report" v2',
    createdAt: "2026-06-14T09:30:00Z",
  },
  {
    id: "a-4",
    projectId: "prj-portal",
    kind: "comment_added",
    actorId: "u-ava",
    summary: 'commented on "Payment method rework"',
    createdAt: "2026-06-13T15:04:00Z",
  },
  {
    id: "a-5",
    projectId: "prj-portal",
    kind: "task_status_changed",
    actorId: "u-priya",
    summary: 'moved "Account settings page" to In progress',
    createdAt: "2026-06-12T11:45:00Z",
  },
  {
    id: "a-6",
    projectId: "prj-erp",
    kind: "due_date_changed",
    actorId: "u-hana",
    summary: 'moved milestone "Reconciliation dry-run #2" to Aug 30',
    createdAt: "2026-06-05T10:12:00Z",
  },
  {
    id: "a-7",
    projectId: "prj-erp",
    kind: "document_uploaded",
    actorId: "u-hana",
    summary: "uploaded Data_Mapping_Spec_v2.xlsx",
    createdAt: "2026-06-02T11:00:00Z",
  },
  {
    id: "a-8",
    projectId: "prj-erp",
    kind: "deliverable_submitted",
    actorId: "u-diego",
    summary: 'submitted deliverable "Reconciliation report — dry run 1"',
    createdAt: "2026-06-08T14:24:00Z",
  },
  {
    id: "a-9",
    projectId: "prj-mobile",
    kind: "comment_added",
    actorId: "u-lena",
    summary: 'commented on "Rebuild sync engine"',
    createdAt: "2026-06-12T13:15:00Z",
  },
  {
    id: "a-10",
    projectId: "prj-mobile",
    kind: "request_submitted",
    actorId: "u-lena",
    summary: 'opened request "Add barcode batch mode"',
    createdAt: "2026-06-11T09:00:00Z",
  },
  {
    id: "a-11",
    projectId: "prj-mobile",
    kind: "task_status_changed",
    actorId: "u-priya",
    summary: 'moved "Rebuild sync engine" to In progress',
    createdAt: "2026-06-10T09:30:00Z",
  },
  {
    id: "a-12",
    projectId: "prj-cloud",
    kind: "milestone_completed",
    actorId: "u-diego",
    summary: 'completed milestone "Workload migration wave 1"',
    createdAt: "2026-04-30T17:00:00Z",
  },
  {
    id: "a-13",
    projectId: "prj-cloud",
    kind: "deliverable_approved",
    actorId: "u-lena",
    summary: 'approved deliverable "Cost Analysis" v2',
    createdAt: "2026-05-24T10:00:00Z",
  },
  {
    id: "a-14",
    projectId: "prj-cloud",
    kind: "document_uploaded",
    actorId: "u-hana",
    summary: "uploaded DR_Runbook_v1.pdf",
    createdAt: "2026-06-05T10:00:00Z",
  },
  {
    id: "a-15",
    projectId: "prj-cloud",
    kind: "task_status_changed",
    actorId: "u-diego",
    summary: 'moved "Chaos drill scheduling" to Not started',
    createdAt: "2026-06-13T09:00:00Z",
  },
];

export const activityForProject = (projectId: string) =>
  activity
    .filter((a) => a.projectId === projectId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

export const recentActivity = (role: "client" | "vendor", limit = 8) => {
  const projects =
    role === "client"
      ? ["prj-portal", "prj-erp", "prj-mobile", "prj-cloud"]
      : ["prj-portal", "prj-erp", "prj-mobile", "prj-cloud"];
  return activity
    .filter((a) => projects.includes(a.projectId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
};
