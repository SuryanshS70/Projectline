import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { getProjects } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/vendor/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Projectline" },
      { name: "description", content: "All projects assigned to your account." },
    ],
  }),
  component: VendorProjectsList,
});

function VendorProjectsList() {
  const { user } = useAuth();
  const projectsQuery = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: getProjects,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Active engagements with your clients." />
      {projectsQuery.isPending ? (
        <ListSkeleton rows={4} />
      ) : projectsQuery.isError ? (
        <EmptyState title="Unable to load projects" description={projectsQuery.error.message} />
      ) : projectsQuery.data.length === 0 ? (
        <EmptyState title="No assigned projects" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projectsQuery.data.map((project) => (
            <Card
              key={project.id}
              className="border-slate-200 shadow-none transition-shadow hover:shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to="/vendor/projects/$projectId"
                      params={{ projectId: project.id }}
                      className="text-base font-semibold text-slate-900 hover:underline"
                    >
                      {project.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{project.clientName}</p>
                  </div>
                  <StatusBadge value={project.status} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{project.description}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Completion</span>
                    <span>{project.completionPercentage}%</span>
                  </div>
                  <ProgressBar value={project.completionPercentage} className="mt-1.5" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Client</span>
                    <br />
                    {project.clientName}
                  </div>
                  <div>
                    <span className="text-slate-400">Due</span>
                    <br />
                    {formatDate(project.endDate)}
                  </div>
                  <div>
                    <span className="text-slate-400">Vendor</span>
                    <br />
                    {project.vendorName}
                  </div>
                  <div>
                    <span className="text-slate-400">Health</span>
                    <br />
                    <StatusBadge value={project.health} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
