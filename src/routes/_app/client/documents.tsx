import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Table, LayoutGrid, Upload as UploadIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import { DocumentTable } from "@/components/common/DocumentTable";
import { EmptyState } from "@/components/common/EmptyState";
import { UploadZone } from "@/components/common/UploadZone";
import { FileTypeIcon } from "@/components/common/FileTypeIcon";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { documents } from "@/data/documents";
import { projects } from "@/data/projects";
import { users } from "@/data/users";
import { getUserById } from "@/data/users";
import type { DocumentRecord } from "@/data/types";
import { formatDate, formatFileSize } from "@/lib/format";

export const Route = createFileRoute("/_app/client/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Projectline" },
      { name: "description", content: "Every document from every project in one place." },
    ],
  }),
  component: ClientDocuments,
});

const projectNames = Object.fromEntries(projects.map((p) => [p.id, p.name]));

function ClientDocuments() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploaderFilter, setUploaderFilter] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [view, setView] = useState<"table" | "card">("table");
  const [preview, setPreview] = useState<DocumentRecord | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = documents.filter((d) => d.visibility === "client_visible");
    if (search) list = list.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    if (projectFilter !== "all") list = list.filter((d) => d.projectId === projectFilter);
    if (typeFilter !== "all") list = list.filter((d) => d.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((d) => d.approval === statusFilter);
    if (uploaderFilter !== "all") list = list.filter((d) => d.uploadedById === uploaderFilter);
    if (sort === "newest") list = [...list].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
    else if (sort === "oldest")
      list = [...list].sort((a, b) => (a.uploadedAt > b.uploadedAt ? 1 : -1));
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [search, projectFilter, typeFilter, statusFilter, uploaderFilter, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Cross-project document repository"
        actions={
          <Button onClick={() => setUploadOpen(true)}>
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
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
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
                {["pdf", "docx", "xlsx", "png", "zip", "pptx"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="not_required">N/A</SelectItem>
              </SelectContent>
            </Select>
            <Select value={uploaderFilter} onValueChange={setUploaderFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any uploader</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex overflow-hidden rounded-md border border-slate-200">
              <button
                onClick={() => setView("table")}
                className={`p-2 ${view === "table" ? "bg-slate-900 text-white" : "text-slate-500"}`}
                aria-label="Table view"
              >
                <Table className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("card")}
                className={`p-2 ${view === "card" ? "bg-slate-900 text-white" : "text-slate-500"}`}
                aria-label="Card view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </FilterToolbar>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No documents match these filters"
          description="Adjust your filters or upload a new document."
        />
      ) : view === "table" ? (
        <DocumentTable
          documents={filtered}
          showProject
          projectNameLookup={projectNames}
          onPreview={setPreview}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Card key={d.id} className="border-slate-200 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileTypeIcon type={d.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{d.name}</p>
                    <p className="truncate text-xs text-slate-500">{projectNames[d.projectId]}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge value={d.approval} />
                  <span className="text-xs text-slate-500">{formatFileSize(d.sizeBytes)}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {getUserById(d.uploadedById)?.name} · {formatDate(d.uploadedAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{preview?.name}</SheetTitle>
          </SheetHeader>
          {preview && (
            <div className="mt-6 space-y-4">
              <FileTypeIcon type={preview.type} className="h-16 w-16" />
              <div className="grid gap-3 text-sm">
                <Row label="Project">{projectNames[preview.projectId]}</Row>
                <Row label="Category">{preview.category}</Row>
                <Row label="Size">{formatFileSize(preview.sizeBytes)}</Row>
                <Row label="Version">v{preview.version}</Row>
                <Row label="Uploaded">{formatDate(preview.uploadedAt)}</Row>
                <Row label="By">{getUserById(preview.uploadedById)?.name}</Row>
                <Row label="Status">
                  <StatusBadge value={preview.approval} />
                </Row>
              </div>
              <p className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                Document preview would render here. This demo does not render actual file contents.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
          </DialogHeader>
          <UploadZone />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm text-slate-800">{children}</span>
    </div>
  );
}
