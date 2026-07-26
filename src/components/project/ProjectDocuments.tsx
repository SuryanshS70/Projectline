import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DocumentTable } from "@/components/common/DocumentTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { UploadZone } from "@/components/common/UploadZone";
import { deleteDocument, getDocuments, uploadDocument, type ApiDocument } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { downloadDocumentToDevice } from "@/lib/documents";

export function ProjectDocuments({
  projectId,
  role,
}: {
  projectId: string;
  role: "client" | "vendor";
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["documents", user?.id, projectId] as const;
  const documentsQuery = useQuery({
    queryKey,
    queryFn: () => getDocuments(projectId),
  });
  const deleteMutation = useMutation({
    mutationFn: (document: ApiDocument) => deleteDocument(document.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success("Document deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Upload a {role === "client" ? "client" : "project"} document
        </h3>
        <p className="mb-4 mt-1 text-xs text-slate-500">
          Files are stored locally for this internship MVP.
        </p>
        <UploadZone
          onUpload={async (file) => {
            await uploadDocument(projectId, file);
            await queryClient.invalidateQueries({ queryKey });
          }}
        />
      </div>

      {documentsQuery.isPending ? (
        <ListSkeleton rows={3} />
      ) : documentsQuery.isError ? (
        <EmptyState title="Unable to load documents" description={documentsQuery.error.message} />
      ) : documentsQuery.data.length === 0 ? (
        <EmptyState title="No documents yet" description="Uploaded files will appear here." />
      ) : (
        <DocumentTable
          documents={documentsQuery.data}
          onDownload={downloadDocumentToDevice}
          onDelete={async (document) => deleteMutation.mutateAsync(document)}
        />
      )}
    </div>
  );
}
