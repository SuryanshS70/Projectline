import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ResponsiveTabs } from "@/components/common/ResponsiveTabs";
import { ProjectOverview } from "@/components/project/ProjectOverview";
import { MilestonesList } from "@/components/project/MilestonesList";
import { DeliverablesList } from "@/components/project/DeliverablesList";
import { ProjectDocuments } from "@/components/project/ProjectDocuments";
import { ProjectActivity } from "@/components/project/ProjectActivity";
import { TasksBoard } from "@/components/project/TasksBoard";
import { ClientRequestsList } from "@/components/project/ClientRequestsList";
import { getProjectById } from "@/data/projects";

export const Route = createFileRoute("/_app/vendor/projects/$projectId")({
  loader: ({ params }) => {
    const project = getProjectById(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.project.name} — Projectline` : "Project — Projectline" },
      { name: "description", content: loaderData?.project.description ?? "" },
    ],
  }),
  component: VendorProjectDetail,
});

function VendorProjectDetail() {
  const { project } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <Link
        to="/vendor/projects"
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All projects
      </Link>

      <PageHeader
        title={project.name}
        description={`Phase: ${project.currentPhase} · Next: ${project.nextMilestone}`}
        actions={<StatusBadge value={project.status} />}
      />

      <ResponsiveTabs
        tabs={[
          {
            value: "overview",
            label: "Overview",
            content: <ProjectOverview project={project} role="vendor" />,
          },
          { value: "tasks", label: "Tasks", content: <TasksBoard projectId={project.id} /> },
          {
            value: "milestones",
            label: "Milestones",
            content: <MilestonesList projectId={project.id} />,
          },
          {
            value: "deliverables",
            label: "Deliverables",
            content: <DeliverablesList projectId={project.id} role="vendor" />,
          },
          {
            value: "documents",
            label: "Documents",
            content: <ProjectDocuments projectId={project.id} role="vendor" />,
          },
          {
            value: "requests",
            label: "Client requests",
            content: <ClientRequestsList projectId={project.id} />,
          },
          {
            value: "activity",
            label: "Activity",
            content: <ProjectActivity projectId={project.id} />,
          },
        ]}
      />
    </div>
  );
}
