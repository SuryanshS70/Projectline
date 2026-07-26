import { createFileRoute } from "@tanstack/react-router";

import { DocumentRepository } from "@/components/documents/DocumentRepository";

export const Route = createFileRoute("/_app/vendor/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Projectline" },
      { name: "description", content: "Every document uploaded across your projects." },
    ],
  }),
  component: () => <DocumentRepository role="vendor" />,
});
