import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { UserAvatar } from "@/components/common/UserAvatar";
import type { Project, Role } from "@/data/types";
import { getUserById } from "@/data/users";
import { getOrgById } from "@/data/organisations";
import { formatDate } from "@/lib/format";

export function ProjectOverview({ project, role }: { project: Project; role: Role }) {
  const pm = getUserById(project.projectManagerId);
  const contact = getUserById(project.clientContactId);
  const vendorOrg = getOrgById(project.vendorOrgId);
  const clientOrg = getOrgById(project.clientOrgId);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border-slate-200 shadow-none lg:col-span-2">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-slate-900">Project description</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{project.description}</p>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">Completion</span>
              <span className="text-slate-600">{project.completion}%</span>
            </div>
            <ProgressBar value={project.completion} className="mt-2" />
          </div>
          <h3 className="mt-6 text-sm font-semibold text-slate-900">
            {role === "vendor" ? "Internal notes" : "Important notes"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{project.notes}</p>
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
          <Detail label="Risk">
            <StatusBadge value={project.risk} />
          </Detail>
          <Detail label="Current phase">{project.currentPhase}</Detail>
          <Detail label={role === "client" ? "Vendor" : "Client"}>
            {role === "client" ? vendorOrg?.name : clientOrg?.name}
          </Detail>
          <Detail label="Project manager">
            <div className="flex items-center gap-2">
              {pm && <UserAvatar name={pm.name} size="sm" />}
              <span>{pm?.name}</span>
            </div>
          </Detail>
          <Detail label={role === "vendor" ? "Client contact" : "Your contact"}>
            <div className="flex items-center gap-2">
              {contact && <UserAvatar name={contact.name} size="sm" />}
              <span>{contact?.name}</span>
            </div>
          </Detail>
          <Detail label="Start date">{formatDate(project.startDate)}</Detail>
          <Detail label="Expected end">{formatDate(project.expectedEndDate)}</Detail>
          <Detail label="Budget">{project.budget}</Detail>
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
