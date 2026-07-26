import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FolderKanban } from "lucide-react";

import { ActivityFeed } from "@/components/common/ActivityFeed";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { recentActivity } from "@/data/activity";
import { getDashboard } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/vendor/dashboard")({
  head: () => ({
    meta: [
      { title: "Vendor dashboard — Projectline" },
      {
        name: "description",
        content: "Execute assigned projects and submit work to your clients.",
      },
    ],
  }),
  component: VendorDashboard,
});

function VendorDashboard() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: getDashboard,
  });

  if (dashboardQuery.isPending) return <ListSkeleton rows={6} />;
  if (dashboardQuery.isError) {
    return (
      <EmptyState title="Unable to load dashboard" description={dashboardQuery.error.message} />
    );
  }

  const { metrics, projects, upcomingMilestones } = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0] ?? "Jamal"}`}
        description="Here's what needs your team's attention."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active projects" value={metrics.activeProjects} icon={FolderKanban} />
        <MetricCard
          label="Tasks due soon"
          value={metrics.tasksDueSoon ?? 0}
          icon={Clock}
          tone="warning"
        />
        <MetricCard
          label="Overdue tasks"
          value={metrics.overdueTasks ?? 0}
          icon={AlertTriangle}
          tone="danger"
        />
        <MetricCard
          label="Awaiting review"
          value={metrics.deliverablesAwaitingReview ?? 0}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">Assigned projects</h3>
            <Link
              to="/vendor/projects"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {projects.map((project) => (
              <Link
                key={project.id}
                to="/vendor/projects/$projectId"
                params={{ projectId: project.id }}
                className="grid gap-3 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{project.name}</p>
                  <p className="truncate text-xs text-slate-500">{project.clientName}</p>
                </div>
                <div className="text-xs text-slate-600">
                  <p className="truncate">{project.description}</p>
                  <p className="text-slate-500">Due {formatDate(project.endDate)}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{project.completionPercentage}%</span>
                    <StatusBadge value={project.health} />
                  </div>
                  <ProgressBar value={project.completionPercentage} className="mt-1.5" />
                </div>
                <StatusBadge value={project.status} />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-none lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Recent activity</h3>
            <ActivityFeed entries={recentActivity("vendor", 6)} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Upcoming milestones</h3>
            {upcomingMilestones.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming milestones.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingMilestones.map((milestone) => (
                  <li key={milestone.id} className="flex items-start gap-2 text-sm">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{milestone.name}</p>
                      <p className="text-xs text-slate-500">{formatDate(milestone.dueDate)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
