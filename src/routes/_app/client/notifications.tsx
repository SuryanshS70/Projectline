import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { notificationsForRole } from "@/data/notifications";
import type { NotificationRecord, NotificationKind } from "@/data/types";
import { formatRelative } from "@/lib/format";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/_app/client/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Projectline" },
      { name: "description", content: "Grouped project notifications." },
    ],
  }),
  component: ClientNotifications,
});

const groupLabels: Record<NotificationKind, string> = {
  approval_request: "Approval requests",
  new_upload: "New vendor uploads",
  deadline: "Upcoming deadlines",
  delayed_milestone: "Delayed milestones",
  project_update: "Project updates",
  feedback: "Feedback",
};

function ClientNotifications() {
  const [items, setItems] = useState<NotificationRecord[]>(() => notificationsForRole("client"));
  const groups = groupBy(items);

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "You're all caught up"}
        actions={
          unread > 0 ? (
            <Button variant="outline" size="sm" onClick={markAll}>
              <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all as read
            </Button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <EmptyState title="No notifications" icon={<Bell className="h-5 w-5" />} />
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([kind, list]) => (
            <section key={kind}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {groupLabels[kind as NotificationKind]}
              </h3>
              <div className="space-y-2">
                {list.map((n) => (
                  <Card
                    key={n.id}
                    className={`border-slate-200 shadow-none ${!n.read ? "bg-blue-50/40" : ""}`}
                  >
                    <CardContent className="flex items-start justify-between gap-4 p-4">
                      <div className="flex items-start gap-3">
                        {!n.read && (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                            aria-label="Unread"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">{n.title}</p>
                          <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatRelative(n.createdAt)}
                          </p>
                        </div>
                      </div>
                      {!n.read && (
                        <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                          Mark read
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupBy(items: NotificationRecord[]): Record<string, NotificationRecord[]> {
  return items.reduce<Record<string, NotificationRecord[]>>((acc, n) => {
    (acc[n.kind] ||= []).push(n);
    return acc;
  }, {});
}

// Prevent StatusBadge unused warning
void StatusBadge;
