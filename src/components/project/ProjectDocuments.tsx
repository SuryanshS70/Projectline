import { useMemo, useState } from "react";
import { UploadZone } from "@/components/common/UploadZone";
import { DocumentTable } from "@/components/common/DocumentTable";
import { EmptyState } from "@/components/common/EmptyState";
import { documentsForProject } from "@/data/documents";
import type { DocumentRecord, Role } from "@/data/types";

export function ProjectDocuments({ projectId, role }: { projectId: string; role: Role }) {
  const base = useMemo(() => documentsForProject(projectId), [projectId]);
  const [extra, setExtra] = useState<DocumentRecord[]>([]);

  const docs = [...extra, ...base].filter((d) =>
    role === "client" ? d.visibility === "client_visible" : true,
  );

  return (
    <div className="space-y-6">
      <UploadZone
        showVisibility={role === "vendor"}
        onUploaded={({ name, size, category, description }) => {
          const type = (name.split(".").pop()?.toLowerCase() ?? "pdf") as DocumentRecord["type"];
          setExtra((prev) => [
            {
              id: crypto.randomUUID(),
              projectId,
              name,
              type,
              sizeBytes: size,
              uploadedById: role === "client" ? "u-ava" : "u-jamal",
              uploadedAt: new Date().toISOString(),
              version: 1,
              category,
              approval: "pending",
              visibility: role === "vendor" ? "client_visible" : "client_visible",
              description,
            },
            ...prev,
          ]);
        }}
      />
      {docs.length === 0 ? (
        <EmptyState title="No documents yet" description="Uploaded files will appear here." />
      ) : (
        <DocumentTable documents={docs} />
      )}
    </div>
  );
}
