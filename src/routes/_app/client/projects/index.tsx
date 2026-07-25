import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { projects } from "@/data/projects";
import { getOrgById } from "@/data/organisations";
import { getUserById, demoClient } from "@/data/users";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/client/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Projectline" },
      { name: "description", content: "All projects delivered to your organisation." },
    ],
  }),
  component: ClientProjectsList,
});

function ClientProjectsList() {
  const list = projects.filter((p) => p.clientOrgId === demoClient.organisationId);
  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="All active engagements across your vendors." />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((p) => {
          const vendor = getOrgById(p.vendorOrgId);
          const pm = getUserById(p.projectManagerId);
          return (
            <Card
              key={p.id}
              className="border-slate-200 shadow-none transition-shadow hover:shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to="/client/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="text-base font-semibold text-slate-900 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{vendor?.name}</p>
                  </div>
                  <StatusBadge value={p.status} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{p.description}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Completion</span>
                    <span>{p.completion}%</span>
                  </div>
                  <ProgressBar value={p.completion} className="mt-1.5" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">PM</span>
                    <br />
                    {pm?.name}
                  </div>
                  <div>
                    <span className="text-slate-400">Due</span>
                    <br />
                    {formatDate(p.expectedEndDate)}
                  </div>
                  <div>
                    <span className="text-slate-400">Next</span>
                    <br />
                    {p.nextMilestone}
                  </div>
                  <div>
                    <span className="text-slate-400">Risk</span>
                    <br />
                    <StatusBadge value={p.risk} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
