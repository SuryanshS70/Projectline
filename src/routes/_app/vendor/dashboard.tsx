import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ActivityFeed } from "@/components/common/ActivityFeed";
import { Card, CardContent } from "@/components/ui/card";
import { projects } from "@/data/projects";
import { getOrgById } from "@/data/organisations";
import { getUserById, demoVendor } from "@/data/users";
import { recentActivity } from "@/data/activity";
import { tasks } from "@/data/tasks";
import { deliverables } from "@/data/deliverables";
import { milestones } from "@/data/milestones";
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
  const list = projects.filter((p) => p.vendorOrgId === demoVendor.organisationId);
  const active = list.filter((p) => p.status !== "completed").length;
  const dueThisWeek = tasks.filter((t) => {
    const days = (new Date(t.dueDate).getTime() - Date.now()) / 86_400_000;
    return days >= 0 && days <= 7 && t.status !== "completed";
  }).length;
  const pendingSubmissions = deliverables.filter(
    (d) => d.submissionStatus === "not_submitted",
  ).length;
  const awaitingApproval = deliverables.filter(
    (d) => d.approvalStatus === "submitted" || d.approvalStatus === "changes_requested",
  ).length;

  const upcoming = milestones
    .filter((m) => m.status !== "completed")
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${demoVendor.name.split(" ")[0]}`}
        description="Here's what needs your team's attention."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active projects" value={active} icon={FolderKanban} />
        <MetricCard label="Due this week" value={dueThisWeek} icon={Clock} tone="warning" />
        <MetricCard
          label="Pending submissions"
          value={pendingSubmissions}
          icon={AlertTriangle}
          tone="danger"
        />
        <MetricCard
          label="Awaiting approval"
          value={awaitingApproval}
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
            {list.map((p) => {
              const client = getOrgById(p.clientOrgId);
              const contact = getUserById(p.clientContactId);
              return (
                <Link
                  key={p.id}
                  to="/vendor/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="grid gap-3 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {client?.name} · {contact?.name}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600">
                    <p>Next: {p.nextMilestone}</p>
                    <p className="text-slate-500">Due {formatDate(p.expectedEndDate)}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{p.completion}%</span>
                      <span className="text-slate-500">{p.currentPhase}</span>
                    </div>
                    <ProgressBar value={p.completion} className="mt-1.5" />
                  </div>
                  <StatusBadge value={p.status} />
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
            <ActivityFeed entries={recentActivity("vendor", 6)} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Upcoming milestones</h3>
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
      </div>
    </div>
  );
}
