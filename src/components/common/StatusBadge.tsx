import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, { label: string; className: string }> = {
  on_track: { label: "On track", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  at_risk: { label: "At risk", className: "border-amber-200 bg-amber-50 text-amber-800" },
  delayed: { label: "Delayed", className: "border-red-200 bg-red-50 text-red-700" },
  completed: { label: "Completed", className: "border-slate-200 bg-slate-50 text-slate-600" },
  on_hold: { label: "On hold", className: "border-slate-200 bg-slate-50 text-slate-600" },
  not_started: { label: "Not started", className: "border-slate-200 bg-slate-50 text-slate-600" },
  in_progress: { label: "In progress", className: "border-blue-200 bg-blue-50 text-blue-700" },
  blocked: { label: "Blocked", className: "border-red-200 bg-red-50 text-red-700" },
  submitted: { label: "Submitted", className: "border-blue-200 bg-blue-50 text-blue-700" },
  approved: { label: "Approved", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  changes_requested: {
    label: "Changes requested",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  pending: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-800" },
  rejected: { label: "Rejected", className: "border-red-200 bg-red-50 text-red-700" },
  not_required: { label: "N/A", className: "border-slate-200 bg-slate-50 text-slate-500" },
  open: { label: "Open", className: "border-blue-200 bg-blue-50 text-blue-700" },
  resolved: { label: "Resolved", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  declined: { label: "Declined", className: "border-slate-200 bg-slate-50 text-slate-600" },
  info: { label: "Update", className: "border-slate-200 bg-slate-50 text-slate-600" },
  milestone: { label: "Milestone", className: "border-blue-200 bg-blue-50 text-blue-700" },
  risk: { label: "Risk", className: "border-amber-200 bg-amber-50 text-amber-800" },
  low: { label: "Low", className: "border-slate-200 bg-slate-50 text-slate-600" },
  medium: { label: "Medium", className: "border-blue-200 bg-blue-50 text-blue-700" },
  high: { label: "High", className: "border-amber-200 bg-amber-50 text-amber-800" },
  urgent: { label: "Urgent", className: "border-red-200 bg-red-50 text-red-700" },
  good: { label: "Healthy", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  warning: { label: "Warning", className: "border-amber-200 bg-amber-50 text-amber-800" },
  critical: { label: "Critical", className: "border-red-200 bg-red-50 text-red-700" },
  internal: { label: "Internal", className: "border-slate-200 bg-slate-50 text-slate-600" },
  client_visible: {
    label: "Client visible",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const entry = map[value] ?? {
    label: value,
    className: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", entry.className, className)}>
      {entry.label}
    </Badge>
  );
}
