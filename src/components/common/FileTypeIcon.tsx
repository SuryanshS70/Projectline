import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  File,
  Presentation,
} from "lucide-react";
import type { DocumentType } from "@/data/types";
import { cn } from "@/lib/utils";

const map = {
  pdf: { Icon: FileText, className: "text-red-600 bg-red-50" },
  doc: { Icon: FileText, className: "text-blue-600 bg-blue-50" },
  docx: { Icon: FileText, className: "text-blue-600 bg-blue-50" },
  xls: { Icon: FileSpreadsheet, className: "text-emerald-600 bg-emerald-50" },
  xlsx: { Icon: FileSpreadsheet, className: "text-emerald-600 bg-emerald-50" },
  png: { Icon: FileImage, className: "text-purple-600 bg-purple-50" },
  jpg: { Icon: FileImage, className: "text-purple-600 bg-purple-50" },
  jpeg: { Icon: FileImage, className: "text-purple-600 bg-purple-50" },
  txt: { Icon: FileText, className: "text-slate-600 bg-slate-100" },
  zip: { Icon: FileArchive, className: "text-amber-700 bg-amber-50" },
  pptx: { Icon: Presentation, className: "text-orange-600 bg-orange-50" },
} as const;

export function FileTypeIcon({ type, className }: { type: DocumentType; className?: string }) {
  const entry = map[type] ?? { Icon: File, className: "text-slate-600 bg-slate-100" };
  const Icon = entry.Icon;
  return (
    <div
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-md",
        entry.className,
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}
