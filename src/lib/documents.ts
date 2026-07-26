import { downloadDocument, type ApiDocument } from "@/lib/api";

export async function downloadDocumentToDevice(document: ApiDocument): Promise<void> {
  const blob = await downloadDocument(document.id);
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = document.originalName;
  anchor.click();
  URL.revokeObjectURL(url);
}
