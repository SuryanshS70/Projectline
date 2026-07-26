import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const projects = [
  {
    id: "prj-portal",
    name: "Customer Portal Redesign",
    description:
      "Redesign the customer portal with improved navigation, self-service account management, and refreshed branding.",
    status: "ON_TRACK" as const,
    health: "GOOD" as const,
    completionPercentage: 62,
    startDate: new Date("2026-03-10"),
    endDate: new Date("2026-09-30"),
    clientName: "Northwind Retail",
    vendorName: "Axiom Consulting",
  },
  {
    id: "prj-erp",
    name: "ERP Data Migration",
    description:
      "Migrate finance and inventory data to a cloud ERP with reconciliation and audit reporting.",
    status: "AT_RISK" as const,
    health: "WARNING" as const,
    completionPercentage: 38,
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-11-20"),
    clientName: "Northwind Retail",
    vendorName: "Bluewave Systems",
  },
  {
    id: "prj-mobile",
    name: "Mobile Application Development",
    description:
      "Build field-service mobile applications with offline capture, barcode scanning, and dispatch integration.",
    status: "DELAYED" as const,
    health: "CRITICAL" as const,
    completionPercentage: 44,
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-08-15"),
    clientName: "Meridian Health",
    vendorName: "Axiom Consulting",
  },
  {
    id: "prj-cloud",
    name: "Cloud Infrastructure Upgrade",
    description:
      "Migrate core workloads to Kubernetes with observability, secrets management, and disaster recovery.",
    status: "ON_TRACK" as const,
    health: "GOOD" as const,
    completionPercentage: 78,
    startDate: new Date("2025-11-10"),
    endDate: new Date("2026-07-15"),
    clientName: "Meridian Health",
    vendorName: "Bluewave Systems",
  },
];

const milestones = [
  {
    id: "ms-p3",
    projectId: "prj-portal",
    name: "Build core flows",
    description: "Implement and test the core customer account workflows.",
    dueDate: new Date("2026-07-10"),
    status: "IN_PROGRESS" as const,
    progress: 65,
    ownerName: "Priya Nair",
  },
  {
    id: "ms-p4",
    projectId: "prj-portal",
    name: "Beta release to pilot users",
    description: "Release the beta application to the agreed pilot cohort.",
    dueDate: new Date("2026-08-01"),
    status: "NOT_STARTED" as const,
    progress: 0,
    ownerName: "Jamal Osei",
  },
  {
    id: "ms-e3",
    projectId: "prj-erp",
    name: "Reconciliation dry-run #1",
    description: "Run and review the first full reconciliation cycle.",
    dueDate: new Date("2026-06-01"),
    status: "DELAYED" as const,
    progress: 30,
    ownerName: "Diego Alvarez",
  },
  {
    id: "ms-e4",
    projectId: "prj-erp",
    name: "Reconciliation dry-run #2",
    description: "Repeat reconciliation after correcting the first-run findings.",
    dueDate: new Date("2026-08-30"),
    status: "NOT_STARTED" as const,
    progress: 0,
    ownerName: "Diego Alvarez",
  },
  {
    id: "ms-m2",
    projectId: "prj-mobile",
    name: "Offline sync architecture",
    description: "Complete the revised offline synchronisation design.",
    dueDate: new Date("2026-04-30"),
    status: "DELAYED" as const,
    progress: 55,
    ownerName: "Priya Nair",
  },
  {
    id: "ms-m3",
    projectId: "prj-mobile",
    name: "TestFlight distribution",
    description: "Distribute the first pilot iOS build.",
    dueDate: new Date("2026-06-30"),
    status: "IN_PROGRESS" as const,
    progress: 40,
    ownerName: "Priya Nair",
  },
  {
    id: "ms-c4",
    projectId: "prj-cloud",
    name: "DR failover exercise",
    description: "Validate recovery procedures with a controlled failover.",
    dueDate: new Date("2026-06-15"),
    status: "IN_PROGRESS" as const,
    progress: 60,
    ownerName: "Hana Sato",
  },
  {
    id: "ms-c5",
    projectId: "prj-cloud",
    name: "Production cutover",
    description: "Move the remaining production workloads to the new platform.",
    dueDate: new Date("2026-07-15"),
    status: "NOT_STARTED" as const,
    progress: 0,
    ownerName: "Hana Sato",
  },
];

const tasks = [
  {
    id: "t-1",
    projectId: "prj-portal",
    milestoneId: "ms-p3",
    title: "Implement account settings page",
    description: "Wire up profile, notifications, and security settings.",
    assignedTo: "Priya Nair",
    priority: "HIGH" as const,
    status: "IN_PROGRESS" as const,
    dueDate: new Date("2026-06-25"),
  },
  {
    id: "t-2",
    projectId: "prj-portal",
    milestoneId: "ms-p3",
    title: "Accessibility audit",
    description: "Complete a WCAG 2.1 AA pass on the dashboard.",
    assignedTo: "Tom Weiss",
    priority: "MEDIUM" as const,
    status: "NOT_STARTED" as const,
    dueDate: new Date("2026-06-30"),
  },
  {
    id: "t-6",
    projectId: "prj-erp",
    milestoneId: "ms-e3",
    title: "AP subledger mapping revisions",
    description: "Rework mappings after the source schema changed.",
    assignedTo: "Hana Sato",
    priority: "URGENT" as const,
    status: "IN_PROGRESS" as const,
    dueDate: new Date("2026-06-20"),
  },
  {
    id: "t-7",
    projectId: "prj-erp",
    milestoneId: "ms-e4",
    title: "Reconciliation script v2",
    description: "Refactor the script for larger reconciliation batches.",
    assignedTo: "Diego Alvarez",
    priority: "HIGH" as const,
    status: "NOT_STARTED" as const,
    dueDate: new Date("2026-07-10"),
  },
  {
    id: "t-9",
    projectId: "prj-mobile",
    milestoneId: "ms-m2",
    title: "Rebuild sync engine",
    description: "Replace the current queued request implementation.",
    assignedTo: "Priya Nair",
    priority: "URGENT" as const,
    status: "IN_PROGRESS" as const,
    dueDate: new Date("2026-06-22"),
  },
  {
    id: "t-10",
    projectId: "prj-mobile",
    milestoneId: "ms-m3",
    title: "Barcode scanner UX pass",
    description: "Improve scanner tap targets and error recovery.",
    assignedTo: "Tom Weiss",
    priority: "MEDIUM" as const,
    status: "NOT_STARTED" as const,
    dueDate: new Date("2026-07-01"),
  },
  {
    id: "t-12",
    projectId: "prj-cloud",
    milestoneId: "ms-c4",
    title: "DR runbook database tier",
    description: "Document and validate database failover steps.",
    assignedTo: "Hana Sato",
    priority: "HIGH" as const,
    status: "IN_PROGRESS" as const,
    dueDate: new Date("2026-06-20"),
  },
  {
    id: "t-13",
    projectId: "prj-cloud",
    milestoneId: "ms-c5",
    title: "Chaos drill scheduling",
    description: "Coordinate the final drill with the client change board.",
    assignedTo: "Diego Alvarez",
    priority: "MEDIUM" as const,
    status: "NOT_STARTED" as const,
    dueDate: new Date("2026-06-25"),
  },
];

const deliverables = [
  {
    id: "d-1",
    projectId: "prj-portal",
    title: "Design system v1.0",
    description: "Tokens, components, and usage guidelines.",
    dueDate: new Date("2026-05-15"),
    submissionStatus: "SUBMITTED" as const,
    approvalStatus: "APPROVED" as const,
  },
  {
    id: "d-2",
    projectId: "prj-portal",
    title: "Beta build package",
    description: "Signed build with release notes for the pilot cohort.",
    dueDate: new Date("2026-08-01"),
    submissionStatus: "NOT_SUBMITTED" as const,
    approvalStatus: "NOT_STARTED" as const,
  },
  {
    id: "d-3",
    projectId: "prj-portal",
    title: "Accessibility audit report",
    description: "WCAG 2.1 AA audit findings.",
    dueDate: new Date("2026-07-10"),
    submissionStatus: "SUBMITTED" as const,
    approvalStatus: "CHANGES_REQUESTED" as const,
    clientFeedback: "Please include a remediation timeline per finding.",
  },
  {
    id: "d-4",
    projectId: "prj-erp",
    title: "Data mapping specification",
    description: "Field-level mapping with transformation rules.",
    dueDate: new Date("2026-04-15"),
    submissionStatus: "SUBMITTED" as const,
    approvalStatus: "CHANGES_REQUESTED" as const,
    clientFeedback: "The AP subledger section needs the updated schema.",
  },
  {
    id: "d-5",
    projectId: "prj-erp",
    title: "Reconciliation report",
    description: "Variance analysis from the first dry run.",
    dueDate: new Date("2026-06-05"),
    submissionStatus: "SUBMITTED" as const,
    approvalStatus: "SUBMITTED" as const,
  },
  {
    id: "d-6",
    projectId: "prj-mobile",
    title: "Offline sync design",
    description: "Architecture, edge cases, and testing plan.",
    dueDate: new Date("2026-04-30"),
    submissionStatus: "SUBMITTED" as const,
    approvalStatus: "APPROVED" as const,
  },
  {
    id: "d-7",
    projectId: "prj-mobile",
    title: "TestFlight build",
    description: "Distributable iOS build for pilot users.",
    dueDate: new Date("2026-06-30"),
    submissionStatus: "NOT_SUBMITTED" as const,
    approvalStatus: "IN_PROGRESS" as const,
  },
  {
    id: "d-8",
    projectId: "prj-cloud",
    title: "DR runbook",
    description: "Full disaster recovery procedure with role assignments.",
    dueDate: new Date("2026-06-15"),
    submissionStatus: "SUBMITTED" as const,
    approvalStatus: "SUBMITTED" as const,
  },
  {
    id: "d-9",
    projectId: "prj-cloud",
    title: "Cutover plan",
    description: "Migration plan with rollback triggers.",
    dueDate: new Date("2026-07-01"),
    submissionStatus: "NOT_SUBMITTED" as const,
    approvalStatus: "IN_PROGRESS" as const,
  },
];

const clientRequests = [
  {
    id: "cr-1",
    projectId: "prj-portal",
    title: "Add SSO for pilot cohort",
    description: "Enable Okta SSO for beta users.",
    priority: "HIGH" as const,
    status: "IN_PROGRESS" as const,
    dueDate: new Date("2026-07-15"),
  },
  {
    id: "cr-2",
    projectId: "prj-portal",
    title: "Marketing preview environment",
    description: "Provide a standalone walkthrough environment.",
    priority: "MEDIUM" as const,
    status: "OPEN" as const,
    dueDate: new Date("2026-07-01"),
  },
  {
    id: "cr-3",
    projectId: "prj-mobile",
    title: "Add barcode batch mode",
    description: "Allow technicians to scan several items before syncing.",
    priority: "HIGH" as const,
    status: "OPEN" as const,
    dueDate: new Date("2026-07-20"),
  },
  {
    id: "cr-4",
    projectId: "prj-erp",
    title: "Auditor reconciliation view",
    description: "Provide a read-only export of dry-run comparisons.",
    priority: "MEDIUM" as const,
    status: "COMPLETED" as const,
    dueDate: new Date("2026-08-10"),
  },
  {
    id: "cr-5",
    projectId: "prj-cloud",
    title: "Additional alert rules",
    description: "Add alerts for weekly cost spikes over fifteen percent.",
    priority: "LOW" as const,
    status: "IN_PROGRESS" as const,
    dueDate: new Date("2026-06-30"),
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.document.deleteMany();
  await prisma.clientRequest.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: "u-ava",
        email: "client@example.com",
        passwordHash,
        name: "Ava Chen",
        role: "CLIENT",
        organisationName: "Northwind Retail",
      },
      {
        id: "u-jamal",
        email: "vendor@example.com",
        passwordHash,
        name: "Jamal Osei",
        role: "VENDOR",
        organisationName: "Axiom Consulting",
      },
    ],
  });

  await prisma.project.createMany({ data: projects });
  await prisma.projectMember.createMany({
    data: [
      { userId: "u-ava", projectId: "prj-portal" },
      { userId: "u-ava", projectId: "prj-erp" },
      { userId: "u-jamal", projectId: "prj-portal" },
      { userId: "u-jamal", projectId: "prj-mobile" },
    ],
  });
  await prisma.milestone.createMany({ data: milestones });
  await prisma.task.createMany({ data: tasks });
  await prisma.deliverable.createMany({ data: deliverables });
  await prisma.clientRequest.createMany({ data: clientRequests });

  console.log(
    `Seeded 2 users, ${projects.length} projects, ${milestones.length} milestones, ${tasks.length} tasks, ${deliverables.length} deliverables, and ${clientRequests.length} client requests.`,
  );
  console.log("Development logins: client@example.com / password123");
  console.log("                    vendor@example.com / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
