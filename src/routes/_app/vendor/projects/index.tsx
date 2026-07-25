import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { projects } from "@/data/projects";
import { getOrgById } from "@/data/organisations";
import { getUserById, demoVendor } from "@/data/users";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/vendor/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Projectline" },
      { name: "description", content: "All projects assigned to your organisation." },
    ],
  }),
  component: VendorProjectsList,
});

function VendorProjectsList() {
  const list = projects.filter((p) => p.vendorOrgId === demoVendor.organisationId);
  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Active engagements with your clients." />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((p) => {
          const client = getOrgById(p.clientOrgId);
          const contact = getUserById(p.clientContactId);
          return (
            <Card
              key={p.id}
              className="border-slate-200 shadow-none transition-shadow hover:shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to="/vendor/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="text-base font-semibold text-slate-900 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{client?.name}</p>
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
                    <span className="text-slate-400">Client contact</span>
                    <br />
                    {contact?.name}
                  </div>
                  <div>
                    <span className="text-slate-400">Due</span>
                    <br />
                    {formatDate(p.expectedEndDate)}
                  </div>
                  <div>
                    <span className="text-slate-400">Phase</span>
                    <br />
                    {p.currentPhase}
                  </div>
                  <div>
                    <span className="text-slate-400">Health</span>
                    <br />
                    <StatusBadge value={p.health} />
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
