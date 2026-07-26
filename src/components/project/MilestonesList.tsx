import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Circle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MilestoneStatus } from "@/data/types";
import { updateMilestone, type ApiMilestone, type ApiProjectDetail } from "@/lib/api";
import { formatDate } from "@/lib/format";

const milestoneStatuses: MilestoneStatus[] = ["not_started", "in_progress", "completed", "delayed"];

const iconFor = (status: MilestoneStatus) => {
  if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (status === "in_progress") return <Clock className="h-5 w-5 text-blue-600" />;
  if (status === "delayed") return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  return <Circle className="h-5 w-5 text-slate-400" />;
};

export function MilestonesList({
  items,
  editable = false,
}: {
  items: ApiMilestone[];
  editable?: boolean;
}) {
  if (items.length === 0) return <EmptyState title="No milestones yet" />;

  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-6">
      {items.map((milestone) => (
        <MilestoneItem key={milestone.id} milestone={milestone} editable={editable} />
      ))}
    </ol>
  );
}

function MilestoneItem({ milestone, editable }: { milestone: ApiMilestone; editable: boolean }) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(milestone.progress);
  const [status, setStatus] = useState(milestone.status);
  const mutation = useMutation({
    mutationFn: () => updateMilestone(milestone.id, { progress, status }),
    onSuccess: (updatedMilestone) => {
      queryClient.setQueriesData<ApiProjectDetail>({ queryKey: ["project"] }, (project) =>
        project
          ? {
              ...project,
              milestones: project.milestones.map((item) =>
                item.id === updatedMilestone.id ? updatedMilestone : item,
              ),
            }
          : project,
      );
      toast.success("Milestone updated");
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    setProgress(milestone.progress);
    setStatus(milestone.status);
  }, [milestone.progress, milestone.status]);

  return (
    <li className="relative">
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

        {editable && (
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[100px_1fr_auto] sm:items-end">
            <label className="space-y-1 text-xs text-slate-600">
              Progress
              <Input
                aria-label={`Progress for ${milestone.name}`}
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(event) => setProgress(Number(event.target.value))}
              />
            </label>
            <label className="space-y-1 text-xs text-slate-600">
              Status
              <select
                aria-label={`Status for ${milestone.name}`}
                value={status}
                onChange={(event) => setStatus(event.target.value as MilestoneStatus)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                {milestoneStatuses.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="sm"
              disabled={mutation.isPending || progress < 0 || progress > 100}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
