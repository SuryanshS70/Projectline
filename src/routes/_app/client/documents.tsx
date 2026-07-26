import { createFileRoute } from "@tanstack/react-router";

import { DocumentRepository } from "@/components/documents/DocumentRepository";

export const Route = createFileRoute("/_app/client/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Projectline" },
      { name: "description", content: "Every document from every project in one place." },
    ],
  }),
  component: () => <DocumentRepository role="client" />,
});
