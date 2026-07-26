import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  updateDeliverable,
  type ApiDeliverable,
  type ApiProjectDetail,
  type DeliverableAction,
} from "@/lib/api";
import { formatDate } from "@/lib/format";

export function DeliverablesList({
  items,
  role,
}: {
  items: ApiDeliverable[];
  role: "client" | "vendor";
}) {
  if (items.length === 0) return <EmptyState title="No deliverables scheduled" />;

  return (
    <div className="space-y-3">
      {items.map((deliverable) => (
        <DeliverableCard key={deliverable.id} deliverable={deliverable} role={role} />
      ))}
    </div>
  );
}

function DeliverableCard({
  deliverable,
  role,
}: {
  deliverable: ApiDeliverable;
  role: "client" | "vendor";
}) {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const mutation = useMutation({
    mutationFn: (action: DeliverableAction) =>
      updateDeliverable(deliverable.id, action, feedback.trim() || undefined),
    onSuccess: (updatedDeliverable) => {
      queryClient.setQueriesData<ApiProjectDetail>({ queryKey: ["project"] }, (project) =>
        project
          ? {
              ...project,
              deliverables: project.deliverables.map((item) =>
                item.id === updatedDeliverable.id ? updatedDeliverable : item,
              ),
            }
          : project,
      );
      setFeedback("");
      toast.success("Deliverable updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const clientCanReview =
    role === "client" &&
    deliverable.submissionStatus === "submitted" &&
    deliverable.approvalStatus !== "approved";

  return (
    <Card className="border-slate-200 shadow-none">
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

        {role === "vendor" && deliverable.submissionStatus !== "submitted" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {deliverable.submissionStatus === "not_submitted" && (
              <Button
                size="sm"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate("READY_FOR_REVIEW")}
              >
                Mark ready for review
              </Button>
            )}
            <Button
              size="sm"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate("SUBMIT")}
            >
              {mutation.isPending ? "Saving…" : "Submit deliverable"}
            </Button>
          </div>
        )}

        {clientCanReview && (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <Textarea
              aria-label={`Feedback for ${deliverable.title}`}
              rows={2}
              placeholder="Feedback is required when requesting changes"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate("APPROVE")}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={mutation.isPending || !feedback.trim()}
                onClick={() => mutation.mutate("REQUEST_CHANGES")}
              >
                Request changes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
