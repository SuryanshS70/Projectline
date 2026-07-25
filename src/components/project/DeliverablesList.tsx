import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { deliverablesForProject } from "@/data/deliverables";
import { formatDate } from "@/lib/format";
import { Download, Eye, Send, Upload } from "lucide-react";
import type { Role } from "@/data/types";
import { toast } from "sonner";

export function DeliverablesList({ projectId, role }: { projectId: string; role: Role }) {
  const items = deliverablesForProject(projectId);
  if (items.length === 0) return <EmptyState title="No deliverables scheduled" />;

  return (
    <div className="space-y-3">
      {items.map((d) => (
        <Card key={d.id} className="border-slate-200 shadow-none">
          <CardContent className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900">{d.title}</h4>
                <StatusBadge value={d.approvalStatus} />
                {d.version > 0 && <span className="text-xs text-slate-500">v{d.version}</span>}
              </div>
              <p className="mt-1 text-sm text-slate-600">{d.description}</p>
              <p className="mt-2 text-xs text-slate-500">Due {formatDate(d.dueDate)}</p>
              {d.feedback && (
                <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-900">
                  <span className="font-medium">Client feedback:</span> {d.feedback}
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {role === "vendor" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success(`Uploaded new version of ${d.title}`)}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toast.success(`Marked ${d.title} ready for review`)}
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Submit
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast(`Previewing ${d.title}`)}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast(`Downloading ${d.title}`)}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
