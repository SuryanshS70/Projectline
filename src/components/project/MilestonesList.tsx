import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { UserAvatar } from "@/components/common/UserAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { milestonesForProject } from "@/data/milestones";
import { getUserById } from "@/data/users";
import { formatDate } from "@/lib/format";
import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import type { MilestoneStatus } from "@/data/types";

const iconFor = (s: MilestoneStatus) => {
  if (s === "completed") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (s === "in_progress") return <Clock className="h-5 w-5 text-blue-600" />;
  if (s === "delayed") return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  return <Circle className="h-5 w-5 text-slate-400" />;
};

export function MilestonesList({ projectId }: { projectId: string }) {
  const items = milestonesForProject(projectId);
  if (items.length === 0) return <EmptyState title="No milestones yet" />;

  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-6">
      {items.map((m) => {
        const owner = getUserById(m.ownerId);
        return (
          <li key={m.id} className="relative">
            <div className="absolute -left-[34px] top-0 grid h-6 w-6 place-items-center rounded-full bg-white ring-2 ring-slate-200">
              {iconFor(m.status)}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900">{m.name}</h4>
                  <p className="mt-1 text-xs text-slate-500">Due {formatDate(m.dueDate)}</p>
                </div>
                <StatusBadge value={m.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  {owner && <UserAvatar name={owner.name} size="sm" />}
                  <span>{owner?.name}</span>
                </div>
                <span>{m.progress}%</span>
              </div>
              <ProgressBar value={m.progress} className="mt-2" />
              {m.dependencies.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Depends on {m.dependencies.length} milestone{m.dependencies.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
