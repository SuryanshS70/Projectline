import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Upload as UploadIcon, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import { DocumentTable } from "@/components/common/DocumentTable";
import { EmptyState } from "@/components/common/EmptyState";
import { UploadZone } from "@/components/common/UploadZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { documents } from "@/data/documents";
import { projects } from "@/data/projects";
import { demoVendor } from "@/data/users";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vendor/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Projectline" },
      { name: "description", content: "Every document uploaded across your projects." },
    ],
  }),
  component: VendorDocuments,
});

const projectNames = Object.fromEntries(projects.map((p) => [p.id, p.name]));

function VendorDocuments() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);

  const vendorProjectIds = projects
    .filter((p) => p.vendorOrgId === demoVendor.organisationId)
    .map((p) => p.id);

  const filtered = useMemo(() => {
    let list = documents.filter((d) => vendorProjectIds.includes(d.projectId));
    if (search) list = list.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    if (projectFilter !== "all") list = list.filter((d) => d.projectId === projectFilter);
    if (visibilityFilter !== "all") list = list.filter((d) => d.visibility === visibilityFilter);
    if (statusFilter !== "all") list = list.filter((d) => d.approval === statusFilter);
    if (typeFilter !== "all") list = list.filter((d) => d.type === typeFilter);
    return list.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  }, [search, projectFilter, visibilityFilter, statusFilter, typeFilter, vendorProjectIds]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Every document your team has uploaded"
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
                {projects
                  .filter((p) => vendorProjectIds.includes(p.id))
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any visibility</SelectItem>
                <SelectItem value="client_visible">Client visible</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
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
            <Button variant="outline" size="sm" onClick={() => toast("Replaced version")}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Version history
            </Button>
          </FilterToolbar>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No documents match these filters" />
      ) : (
        <DocumentTable
          documents={filtered}
          showProject
          projectNameLookup={projectNames}
          onDelete={() => toast.success("Document deleted")}
        />
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
          </DialogHeader>
          <UploadZone showVisibility />
        </DialogContent>
      </Dialog>
    </div>
  );
}
