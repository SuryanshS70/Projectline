import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiMilestone, ApiTask } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function TasksBoard({
  items,
  milestones,
}: {
  items: ApiTask[];
  milestones: ApiMilestone[];
}) {
  if (items.length === 0) return <EmptyState title="No tasks yet" />;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead>Task</TableHead>
            <TableHead className="hidden md:table-cell">Assignee</TableHead>
            <TableHead className="hidden sm:table-cell">Priority</TableHead>
            <TableHead className="hidden lg:table-cell">Milestone</TableHead>
            <TableHead className="hidden sm:table-cell">Due</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((task) => {
            const milestone = milestones.find((item) => item.id === task.milestoneId);
            return (
              <TableRow key={task.id}>
                <TableCell>
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <p className="line-clamp-1 text-xs text-slate-500">{task.description}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={task.assignedTo} size="sm" />
                    <span className="text-sm text-slate-700">{task.assignedTo}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusBadge value={task.priority} />
                </TableCell>
                <TableCell className="hidden text-sm text-slate-600 lg:table-cell">
                  {milestone?.name ?? "—"}
                </TableCell>
                <TableCell className="hidden text-sm text-slate-600 sm:table-cell">
                  {formatDate(task.dueDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge value={task.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
