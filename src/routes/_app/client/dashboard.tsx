import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ActivityFeed } from "@/components/common/ActivityFeed";
import { Card, CardContent } from "@/components/ui/card";
import { FileTypeIcon } from "@/components/common/FileTypeIcon";
import { projects } from "@/data/projects";
import { getOrgById } from "@/data/organisations";
import { getUserById, demoClient } from "@/data/users";
import { recentActivity } from "@/data/activity";
import { documents } from "@/data/documents";
import { milestones } from "@/data/milestones";
import { formatDate, formatRelative } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/client/dashboard")({
  head: () => ({
    meta: [
      { title: "Client dashboard — Projectline" },
      { name: "description", content: "Monitor active projects delivered by your vendors." },
    ],
  }),
  component: ClientDashboard,
});

function ClientDashboard() {
  const { user } = useAuth();
  const clientProjects = projects.filter((p) => p.clientOrgId === demoClient.organisationId);
  const active = clientProjects.filter((p) => p.status !== "completed").length;
  const delayed = clientProjects.filter(
    (p) => p.status === "delayed" || p.status === "at_risk",
  ).length;
  const pending = documents.filter((d) => d.approval === "pending").length;

  const upcoming = milestones
    .filter((m) => m.status !== "completed")
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    .slice(0, 4);

  const latestDocs = [...documents]
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0] ?? "Ava"}`}
        description="Here's what's happening across your projects today."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total projects" value={clientProjects.length} icon={FolderKanban} />
        <MetricCard label="Active" value={active} icon={Clock} tone="default" />
        <MetricCard label="Delayed / at risk" value={delayed} icon={AlertTriangle} tone="danger" />
        <MetricCard label="Pending approvals" value={pending} icon={CheckCircle2} tone="warning" />
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">Project status</h3>
            <Link
              to="/client/projects"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {clientProjects.map((p) => {
              const vendor = getOrgById(p.vendorOrgId);
              const pm = getUserById(p.projectManagerId);
              return (
                <Link
                  key={p.id}
                  to="/client/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="grid gap-3 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {vendor?.name} · PM {pm?.name}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600">
                    <p>Next: {p.nextMilestone}</p>
                    <p className="text-slate-500">Due {formatDate(p.expectedEndDate)}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{p.completion}%</span>
                      <span className="text-slate-500">Risk: {p.risk}</span>
                    </div>
                    <ProgressBar value={p.completion} className="mt-1.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={p.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-none lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Recent activity</h3>
            <ActivityFeed entries={recentActivity("client", 6)} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Upcoming deadlines</h3>
              <ul className="space-y-3">
                {upcoming.map((m) => (
                  <li key={m.id} className="flex items-start gap-2 text-sm">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">{formatDate(m.dueDate)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Latest documents</h3>
              <ul className="space-y-3">
                {latestDocs.map((d) => (
                  <li key={d.id} className="flex items-center gap-3">
                    <FileTypeIcon type={d.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{d.name}</p>
                      <p className="text-xs text-slate-500">{formatRelative(d.uploadedAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
