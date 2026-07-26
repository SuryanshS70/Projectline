import { AlertTriangle, CheckCircle2, Circle, Clock } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import type { MilestoneStatus } from "@/data/types";
import type { ApiMilestone } from "@/lib/api";
import { formatDate } from "@/lib/format";

const iconFor = (status: MilestoneStatus) => {
  if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (status === "in_progress") return <Clock className="h-5 w-5 text-blue-600" />;
  if (status === "delayed") return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  return <Circle className="h-5 w-5 text-slate-400" />;
};

export function MilestonesList({ items }: { items: ApiMilestone[] }) {
  if (items.length === 0) return <EmptyState title="No milestones yet" />;

  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-6">
      {items.map((milestone) => (
        <li key={milestone.id} className="relative">
          <div className="absolute -left-[34px] top-0 grid h-6 w-6 place-items-center rounded-full bg-white ring-2 ring-slate-200">
            {iconFor(milestone.status)}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">{milestone.name}</h4>
                <p className="mt-1 text-sm text-slate-600">{milestone.description}</p>
                <p className="mt-1 text-xs text-slate-500">Due {formatDate(milestone.dueDate)}</p>
              </div>
              <StatusBadge value={milestone.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <UserAvatar name={milestone.ownerName} size="sm" />
                <span>{milestone.ownerName}</span>
              </div>
              <span>{milestone.progress}%</span>
            </div>
            <ProgressBar value={milestone.progress} className="mt-2" />
          </div>
        </li>
      ))}
    </ol>
  );
}
