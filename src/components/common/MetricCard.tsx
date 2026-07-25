import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  tone?: "default" | "warning" | "danger" | "success";
  className?: string;
}

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-slate-600 bg-slate-50",
  warning: "text-amber-700 bg-amber-50",
  danger: "text-red-700 bg-red-50",
  success: "text-emerald-700 bg-emerald-50",
};

export function MetricCard({ label, value, icon: Icon, hint, tone = "default", className }: Props) {
  return (
    <Card className={cn("border-slate-200 shadow-none", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <div
            className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", toneMap[tone])}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
