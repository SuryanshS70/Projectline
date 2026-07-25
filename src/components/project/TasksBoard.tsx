import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { tasksForProject } from "@/data/tasks";
import { getUserById } from "@/data/users";
import { milestonesForProject } from "@/data/milestones";
import { formatDate } from "@/lib/format";
import type { Task, TaskStatus } from "@/data/types";
import { toast } from "sonner";

const statuses: TaskStatus[] = ["not_started", "in_progress", "blocked", "completed"];

export function TasksBoard({ projectId }: { projectId: string }) {
  const initial = useMemo(() => tasksForProject(projectId), [projectId]);
  const [items, setItems] = useState<Task[]>(initial);
  const milestones = useMemo(() => milestonesForProject(projectId), [projectId]);

  if (items.length === 0) return <EmptyState title="No tasks yet" />;

  const setStatus = (id: string, status: TaskStatus) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success("Task status updated");
  };
  const toggleDone = (id: string, done: boolean) =>
    setStatus(id, done ? "completed" : "in_progress");

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-10"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead className="hidden md:table-cell">Assignee</TableHead>
            <TableHead className="hidden sm:table-cell">Priority</TableHead>
            <TableHead className="hidden lg:table-cell">Milestone</TableHead>
            <TableHead className="hidden sm:table-cell">Due</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => {
            const assignee = getUserById(t.assigneeId);
            const ms = milestones.find((m) => m.id === t.milestoneId);
            const done = t.status === "completed";
            return (
              <TableRow key={t.id}>
                <TableCell>
                  <Checkbox checked={done} onCheckedChange={(v) => toggleDone(t.id, Boolean(v))} />
                </TableCell>
                <TableCell>
                  <p
                    className={`text-sm font-medium ${done ? "text-slate-400 line-through" : "text-slate-900"}`}
                  >
                    {t.title}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {assignee && (
                    <div className="flex items-center gap-2">
                      <UserAvatar name={assignee.name} size="sm" />
                      <span className="text-sm text-slate-700">{assignee.name}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusBadge value={t.priority} />
                </TableCell>
                <TableCell className="hidden text-sm text-slate-600 lg:table-cell">
                  {ms?.name ?? "—"}
                </TableCell>
                <TableCell className="hidden text-sm text-slate-600 sm:table-cell">
                  {formatDate(t.dueDate)}
                </TableCell>
                <TableCell>
                  <Select value={t.status} onValueChange={(v) => setStatus(t.id, v as TaskStatus)}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
