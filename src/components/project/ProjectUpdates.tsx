import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { updatesForProject } from "@/data/updates";
import { getUserById } from "@/data/users";
import { formatRelative } from "@/lib/format";
import { Paperclip } from "lucide-react";

export function ProjectUpdates({ projectId }: { projectId: string }) {
  const items = updatesForProject(projectId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (items.length === 0) return <EmptyState title="No updates yet" />;

  return (
    <div className="space-y-4">
      {items.map((u) => {
        const author = getUserById(u.authorId);
        return (
          <Card key={u.id} className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {author && <UserAvatar name={author.name} size="sm" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{author?.name}</p>
                    <p className="text-xs text-slate-500">{formatRelative(u.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.hasAttachment && <Paperclip className="h-4 w-4 text-slate-400" />}
                  <StatusBadge value={u.status} />
                </div>
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-900">{u.title}</h4>
              <p className="mt-1 text-sm text-slate-600">{u.body}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
