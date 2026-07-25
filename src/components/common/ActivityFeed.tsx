import {
  FileUp,
  CheckCircle2,
  MessageSquare,
  CalendarClock,
  UploadCloud,
  ListTodo,
  Flag,
  Send,
} from "lucide-react";
import type { ActivityEntry, ActivityKind } from "@/data/types";
import { getUserById } from "@/data/users";
import { UserAvatar } from "./UserAvatar";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const iconMap: Record<ActivityKind, { Icon: typeof FileUp; tone: string }> = {
  document_uploaded: { Icon: UploadCloud, tone: "bg-blue-50 text-blue-600" },
  milestone_completed: { Icon: Flag, tone: "bg-emerald-50 text-emerald-600" },
  deliverable_approved: { Icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
  deliverable_submitted: { Icon: Send, tone: "bg-blue-50 text-blue-600" },
  due_date_changed: { Icon: CalendarClock, tone: "bg-amber-50 text-amber-700" },
  comment_added: { Icon: MessageSquare, tone: "bg-slate-100 text-slate-600" },
  task_status_changed: { Icon: ListTodo, tone: "bg-slate-100 text-slate-600" },
  request_submitted: { Icon: FileUp, tone: "bg-purple-50 text-purple-600" },
};

export function ActivityFeed({
  entries,
  className,
}: {
  entries: ActivityEntry[];
  className?: string;
}) {
  return (
    <ol className={cn("space-y-4", className)}>
      {entries.map((e) => {
        const user = getUserById(e.actorId);
        const { Icon, tone } = iconMap[e.kind];
        return (
          <li key={e.id} className="flex items-start gap-3">
            <div
              className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full", tone)}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-800">
                <span className="font-medium">{user?.name ?? "Someone"}</span>{" "}
                <span className="text-slate-600">{e.summary}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{formatRelative(e.createdAt)}</p>
            </div>
            <UserAvatar name={user?.name ?? "?"} size="sm" className="hidden sm:flex" />
          </li>
        );
      })}
    </ol>
  );
}
