import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload as UploadIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DocumentTable } from "@/components/common/DocumentTable";
import { EmptyState } from "@/components/common/EmptyState";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { UploadZone } from "@/components/common/UploadZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteDocument,
  getDocuments,
  getProjects,
  uploadDocument,
  type ApiDocument,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { downloadDocumentToDevice } from "@/lib/documents";

export function DocumentRepository({ role }: { role: "client" | "vendor" }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: getProjects,
  });
  const projectIds = useMemo(
    () => projectsQuery.data?.map((project) => project.id) ?? [],
    [projectsQuery.data],
  );
  const documentsKey = ["documents", user?.id, "all", projectIds.join(",")] as const;
  const documentsQuery = useQuery({
    queryKey: documentsKey,
    enabled: projectIds.length > 0,
    queryFn: async () =>
      (await Promise.all(projectIds.map((projectId) => getDocuments(projectId)))).flat(),
  });
  const deleteMutation = useMutation({
    mutationFn: (document: ApiDocument) => deleteDocument(document.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
      toast.success("Document deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!uploadProjectId && projectIds[0]) setUploadProjectId(projectIds[0]);
  }, [projectIds, uploadProjectId]);

  const projectNames = useMemo(
    () =>
      Object.fromEntries((projectsQuery.data ?? []).map((project) => [project.id, project.name])),
    [projectsQuery.data],
  );

  const filtered = useMemo(() => {
    let documents = documentsQuery.data ?? [];
    if (search) {
      documents = documents.filter((document) =>
        document.originalName.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (projectFilter !== "all") {
      documents = documents.filter((document) => document.projectId === projectFilter);
    }
    if (typeFilter !== "all") {
      documents = documents.filter(
        (document) => document.originalName.split(".").pop()?.toLowerCase() === typeFilter,
      );
    }
    return [...documents].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [documentsQuery.data, projectFilter, search, typeFilter]);

  const loading = projectsQuery.isPending || (projectIds.length > 0 && documentsQuery.isPending);
  const error = projectsQuery.error ?? documentsQuery.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description={
          role === "client"
            ? "Cross-project document repository"
            : "Every document across your assigned projects"
        }
        actions={
          <Button disabled={projectIds.length === 0} onClick={() => setUploadOpen(true)}>
            <UploadIcon className="mr-1.5 h-4 w-4" /> Upload document
          </Button>
        }
      />

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-5">
          <FilterToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search documents..."
          >
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {(projectsQuery.data ?? []).map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "txt", "zip"].map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {type.toUpperCase()}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </FilterToolbar>
        </CardContent>
      </Card>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <EmptyState title="Unable to load documents" description={error.message} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No documents match these filters"
          description="Adjust the filters or upload a document."
        />
      ) : (
        <DocumentTable
          documents={filtered}
          showProject
          projectNameLookup={projectNames}
          onDownload={downloadDocumentToDevice}
          onDelete={async (document) => deleteMutation.mutateAsync(document)}
        />
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Project
              <Select value={uploadProjectId} onValueChange={setUploadProjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(projectsQuery.data ?? []).map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <UploadZone
              onUpload={async (file) => {
                await uploadDocument(uploadProjectId, file);
                await queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
              }}
              onUploaded={() => setUploadOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
