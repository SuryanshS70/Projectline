import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiDeliverable } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function DeliverablesList({ items }: { items: ApiDeliverable[] }) {
  if (items.length === 0) return <EmptyState title="No deliverables scheduled" />;

  return (
    <div className="space-y-3">
      {items.map((deliverable) => (
        <Card key={deliverable.id} className="border-slate-200 shadow-none">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900">{deliverable.title}</h4>
              <StatusBadge value={deliverable.approvalStatus} />
              <StatusBadge value={deliverable.submissionStatus} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{deliverable.description}</p>
            <p className="mt-2 text-xs text-slate-500">Due {formatDate(deliverable.dueDate)}</p>
            {deliverable.clientFeedback && (
              <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-900">
                <span className="font-medium">Client feedback:</span> {deliverable.clientFeedback}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
