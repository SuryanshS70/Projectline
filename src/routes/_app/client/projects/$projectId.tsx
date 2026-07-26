import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { ResponsiveTabs } from "@/components/common/ResponsiveTabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeliverablesList } from "@/components/project/DeliverablesList";
import { ClientRequestsList } from "@/components/project/ClientRequestsList";
import { MilestonesList } from "@/components/project/MilestonesList";
import { ProjectActivity } from "@/components/project/ProjectActivity";
import { ProjectDocuments } from "@/components/project/ProjectDocuments";
import { ProjectOverview } from "@/components/project/ProjectOverview";
import { ProjectUpdates } from "@/components/project/ProjectUpdates";
import { ApiError, getProject } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/client/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project — Projectline" },
      { name: "description", content: "Project overview and delivery status." },
    ],
  }),
  component: ClientProjectDetail,
});

function ClientProjectDetail() {
  const { projectId } = Route.useParams();
  const { user } = useAuth();
  const projectQuery = useQuery({
    queryKey: ["project", user?.id, projectId],
    queryFn: () => getProject(projectId),
  });

  if (projectQuery.isPending) return <ListSkeleton rows={5} />;
  if (projectQuery.isError) {
    const notFound = projectQuery.error instanceof ApiError && projectQuery.error.status === 404;
    return (
      <EmptyState
        title={notFound ? "Project not found" : "Unable to load project"}
        description={
          notFound
            ? "This project does not exist or is not assigned to your account."
            : projectQuery.error.message
        }
      />
    );
  }

  const project = projectQuery.data;

  return (
    <div className="space-y-6">
      <Link
        to="/client/projects"
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All projects
      </Link>

      <PageHeader
        title={project.name}
        description={`Delivered by ${project.vendorName} · Due ${formatDate(project.endDate)}`}
        actions={<StatusBadge value={project.status} />}
      />

      <ResponsiveTabs
        tabs={[
          {
            value: "overview",
            label: "Overview",
            content: <ProjectOverview project={project} role="client" />,
          },
          {
            value: "milestones",
            label: "Milestones",
            content: <MilestonesList items={project.milestones} />,
          },
          {
            value: "deliverables",
            label: "Deliverables",
            content: <DeliverablesList items={project.deliverables} role="client" />,
          },
          {
            value: "requests",
            label: "Client requests",
            content: (
              <ClientRequestsList
                projectId={project.id}
                items={project.clientRequests}
                role="client"
              />
            ),
          },
          {
            value: "documents",
            label: "Documents",
            content: <ProjectDocuments projectId={project.id} role="client" />,
          },
          {
            value: "updates",
            label: "Updates",
            content: <ProjectUpdates projectId={project.id} />,
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
