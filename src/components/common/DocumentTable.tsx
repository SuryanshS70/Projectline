import { Download, Eye, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileTypeIcon } from "./FileTypeIcon";
import { StatusBadge } from "./StatusBadge";
import type { DocumentRecord } from "@/data/types";
import { getUserById } from "@/data/users";
import { formatDate, formatFileSize } from "@/lib/format";
import { toast } from "sonner";

interface Props {
  documents: DocumentRecord[];
  onPreview?: (doc: DocumentRecord) => void;
  onDelete?: (doc: DocumentRecord) => void;
  showProject?: boolean;
  projectNameLookup?: Record<string, string>;
}

export function DocumentTable({
  documents,
  onPreview,
  onDelete,
  showProject,
  projectNameLookup,
}: Props) {
  const simulate = (label: string, name: string) => toast.success(`${label} · ${name}`);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead>Name</TableHead>
            {showProject && <TableHead>Project</TableHead>}
            <TableHead className="hidden md:table-cell">Uploaded by</TableHead>
            <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
            <TableHead className="hidden sm:table-cell">Size</TableHead>
            <TableHead className="hidden md:table-cell">Version</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead className="w-1 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <FileTypeIcon type={doc.type} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{doc.name}</p>
                    <p className="truncate text-xs text-slate-500">{doc.category}</p>
                  </div>
                </div>
              </TableCell>
              {showProject && (
                <TableCell className="text-sm text-slate-600">
                  {projectNameLookup?.[doc.projectId] ?? doc.projectId}
                </TableCell>
              )}
              <TableCell className="hidden text-sm text-slate-600 md:table-cell">
                {getUserById(doc.uploadedById)?.name ?? "Unknown"}
              </TableCell>
              <TableCell className="hidden text-sm text-slate-600 lg:table-cell">
                {formatDate(doc.uploadedAt)}
              </TableCell>
              <TableCell className="hidden text-sm text-slate-600 sm:table-cell">
                {formatFileSize(doc.sizeBytes)}
              </TableCell>
              <TableCell className="hidden text-sm text-slate-600 md:table-cell">
                v{doc.version}
              </TableCell>
              <TableCell>
                <StatusBadge value={doc.approval} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (onPreview ? onPreview(doc) : simulate("Previewing", doc.name))}
                    aria-label="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => simulate("Downloading", doc.name)}
                    aria-label="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(doc)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
