import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiClientRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function ClientRequestsList({ items }: { items: ApiClientRequest[] }) {
  if (items.length === 0) return <EmptyState title="No client requests" />;

  return (
    <div className="space-y-3">
      {items.map((request) => (
        <Card key={request.id} className="border-slate-200 shadow-none">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900">{request.title}</h4>
              <StatusBadge value={request.status} />
              <StatusBadge value={request.priority} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{request.description}</p>
            <p className="mt-2 text-xs text-slate-500">
              Requested {formatDate(request.createdAt)} · Due {formatDate(request.dueDate)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
