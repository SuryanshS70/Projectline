import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "prj-portal",
    name: "Customer Portal Redesign",
    description:
      "Redesign the customer-facing portal with a new information architecture, refreshed brand system, and improved self-service flows for account management and support.",
    clientOrgId: "org-c1",
    vendorOrgId: "org-v1",
    status: "on_track",
    completion: 62,
    startDate: "2026-03-10",
    expectedEndDate: "2026-09-30",
    projectManagerId: "u-jamal",
    clientContactId: "u-ava",
    nextMilestone: "Beta release to pilot users",
    currentPhase: "Build & QA",
    risk: "low",
    budget: "$420,000",
    health: "good",
    notes:
      "Pilot cohort confirmed for July. Design system tokens locked. Two accessibility issues to resolve before beta.",
  },
  {
    id: "prj-erp",
    name: "ERP Data Migration",
    description:
      "Migrate legacy finance and inventory data from on-premise systems to the new cloud ERP, with reconciliation and audit reporting.",
    clientOrgId: "org-c1",
    vendorOrgId: "org-v2",
    status: "at_risk",
    completion: 38,
    startDate: "2026-01-15",
    expectedEndDate: "2026-11-20",
    projectManagerId: "u-hana",
    clientContactId: "u-marcus",
    nextMilestone: "Reconciliation dry-run #2",
    currentPhase: "Data mapping",
    risk: "medium",
    budget: "$680,000",
    health: "warning",
    notes:
      "Source schema drift discovered in the AP subledger. Extra two-week mapping cycle scheduled. Client SME availability is the main constraint.",
  },
  {
    id: "prj-mobile",
    name: "Mobile Application Development",
    description:
      "Native iOS and Android application for field technicians, including offline capture, barcode scanning, and integration with the dispatch system.",
    clientOrgId: "org-c2",
    vendorOrgId: "org-v1",
    status: "delayed",
    completion: 44,
    startDate: "2026-02-01",
    expectedEndDate: "2026-08-15",
    projectManagerId: "u-jamal",
    clientContactId: "u-lena",
    nextMilestone: "TestFlight distribution",
    currentPhase: "Feature build",
    risk: "high",
    budget: "$310,000",
    health: "critical",
    notes:
      "Offline sync architecture required rework. Scope reduction under discussion; awaiting client sign-off on Phase 2 features.",
  },
  {
    id: "prj-cloud",
    name: "Cloud Infrastructure Upgrade",
    description:
      "Migrate core workloads to a modern Kubernetes platform with observability, secrets management, and disaster recovery playbooks.",
    clientOrgId: "org-c2",
    vendorOrgId: "org-v2",
    status: "on_track",
    completion: 78,
    startDate: "2025-11-10",
    expectedEndDate: "2026-07-15",
    projectManagerId: "u-hana",
    clientContactId: "u-lena",
    nextMilestone: "DR failover exercise",
    currentPhase: "Cutover prep",
    risk: "low",
    budget: "$540,000",
    health: "good",
    notes:
      "Production cutover window scheduled for the July long weekend. Rollback plan approved by change board.",
  },
];

export const getProjectById = (id: string) => projects.find((p) => p.id === id);
export const projectsForClientOrg = (orgId: string) =>
  projects.filter((p) => p.clientOrgId === orgId);
export const projectsForVendorOrg = (orgId: string) =>
  projects.filter((p) => p.vendorOrgId === orgId);
