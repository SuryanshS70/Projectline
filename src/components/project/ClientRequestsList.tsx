import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { requestsForProject } from "@/data/clientRequests";
import { getUserById } from "@/data/users";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export function ClientRequestsList({ projectId }: { projectId: string }) {
  const items = requestsForProject(projectId);
  if (items.length === 0) return <EmptyState title="No client requests" />;

  return (
    <div className="space-y-3">
      {items.map((r) => {
        const requester = getUserById(r.requesterId);
        return (
          <Card key={r.id} className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{r.title}</h4>
                    <StatusBadge value={r.status} />
                    <StatusBadge value={r.priority} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{r.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Requested by {requester?.name} · {formatDate(r.requestedAt)} · Due{" "}
                    {formatDate(r.dueDate)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`Responded to "${r.title}"`)}
                >
                  Respond
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
