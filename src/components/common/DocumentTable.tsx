import { Download, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FileTypeIcon } from "@/components/common/FileTypeIcon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DocumentType } from "@/data/types";
import type { ApiDocument } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/format";

interface Props {
  documents: ApiDocument[];
  onDownload: (document: ApiDocument) => Promise<void>;
  onDelete: (document: ApiDocument) => Promise<void>;
  showProject?: boolean;
  projectNameLookup?: Record<string, string>;
}

function documentType(name: string): DocumentType {
  return (name.split(".").pop()?.toLowerCase() ?? "txt") as DocumentType;
}

export function DocumentTable({
  documents,
  onDownload,
  onDelete,
  showProject,
  projectNameLookup,
}: Props) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ApiDocument | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const download = async (document: ApiDocument) => {
    setDownloadingId(document.id);
    try {
      await onDownload(document);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Document download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await onDelete(deleting);
      setDeleting(null);
    } catch {
      // The repository mutation displays the API error.
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Name</TableHead>
              {showProject && <TableHead>Project</TableHead>}
              <TableHead className="hidden md:table-cell">Uploaded by</TableHead>
              <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
              <TableHead className="hidden sm:table-cell">Size</TableHead>
              <TableHead className="w-1 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <FileTypeIcon type={documentType(document.originalName)} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {document.originalName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{document.mimeType}</p>
                    </div>
                  </div>
                </TableCell>
                {showProject && (
                  <TableCell className="text-sm text-slate-600">
                    {projectNameLookup?.[document.projectId] ?? document.projectId}
                  </TableCell>
                )}
                <TableCell className="hidden text-sm text-slate-600 md:table-cell">
                  {document.uploadedBy.name}
                </TableCell>
                <TableCell className="hidden text-sm text-slate-600 lg:table-cell">
                  {formatDate(document.createdAt)}
                </TableCell>
                <TableCell className="hidden text-sm text-slate-600 sm:table-cell">
                  {formatFileSize(document.fileSize)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={downloadingId === document.id}
                      onClick={() => void download(document)}
                      aria-label={`Download ${document.originalName}`}
                    >
                      {downloadingId === document.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleting(document)}
                      aria-label={`Delete ${document.originalName}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.originalName} will be removed from this local MVP and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletePending}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                void remove();
              }}
            >
              {deletePending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
