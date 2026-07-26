import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import type { Role } from "@/data/types";
import type { ApiProject } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function ProjectOverview({ project, role }: { project: ApiProject; role: Role }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border-slate-200 shadow-none lg:col-span-2">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-slate-900">Project description</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{project.description}</p>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">Completion</span>
              <span className="text-slate-600">{project.completionPercentage}%</span>
            </div>
            <ProgressBar value={project.completionPercentage} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="space-y-4 p-6 text-sm">
          <Detail label="Status">
            <StatusBadge value={project.status} />
          </Detail>
          <Detail label="Health">
            <StatusBadge value={project.health} />
          </Detail>
          <Detail label={role === "client" ? "Vendor" : "Client"}>
            {role === "client" ? project.vendorName : project.clientName}
          </Detail>
          <Detail label="Start date">{formatDate(project.startDate)}</Detail>
          <Detail label="Expected end">{formatDate(project.endDate)}</Detail>
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-right text-sm text-slate-800">{children}</span>
    </div>
  );
}
