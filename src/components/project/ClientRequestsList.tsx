import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RequestStatus, TaskPriority } from "@/data/types";
import {
  createClientRequest,
  updateClientRequest,
  type ApiClientRequest,
  type ApiProjectDetail,
} from "@/lib/api";
import { formatDate } from "@/lib/format";

const requestStatuses: RequestStatus[] = ["open", "in_progress", "completed"];

export function ClientRequestsList({
  projectId,
  items,
  role,
}: {
  projectId: string;
  items: ApiClientRequest[];
  role: "client" | "vendor";
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");

  const createMutation = useMutation({
    mutationFn: () => createClientRequest(projectId, { title, description, priority, dueDate }),
    onSuccess: (clientRequest) => {
      queryClient.setQueriesData<ApiProjectDetail>({ queryKey: ["project"] }, (project) =>
        project
          ? { ...project, clientRequests: [clientRequest, ...project.clientRequests] }
          : project,
      );
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      toast.success("Client request created");
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: RequestStatus }) =>
      updateClientRequest(requestId, status),
    onSuccess: (updatedRequest) => {
      queryClient.setQueriesData<ApiProjectDetail>({ queryKey: ["project"] }, (project) =>
        project
          ? {
              ...project,
              clientRequests: project.clientRequests.map((item) =>
                item.id === updatedRequest.id ? updatedRequest : item,
              ),
            }
          : project,
      );
      toast.success("Client request updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="space-y-4">
      {role === "client" && (
        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold text-slate-900">Create client request</h4>
            <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
              <Input
                aria-label="Request title"
                placeholder="Request title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <Input
                aria-label="Request due date"
                type="date"
                required
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
              <Textarea
                aria-label="Request description"
                className="md:col-span-2"
                placeholder="Describe the request"
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <select
                aria-label="Request priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState title="No client requests" />
      ) : (
        items.map((item) => (
          <Card key={item.id} className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                <StatusBadge value={item.status} />
                <StatusBadge value={item.priority} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                Requested {formatDate(item.createdAt)} · Due {formatDate(item.dueDate)}
              </p>
              {role === "vendor" && (
                <select
                  aria-label={`Status for ${item.title}`}
                  value={item.status}
                  disabled={
                    updateMutation.isPending && updateMutation.variables?.requestId === item.id
                  }
                  onChange={(event) =>
                    updateMutation.mutate({
                      requestId: item.id,
                      status: event.target.value as RequestStatus,
                    })
                  }
                  className="mt-3 h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium"
                >
                  {requestStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
