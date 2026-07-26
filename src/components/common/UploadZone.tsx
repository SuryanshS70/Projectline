import { CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  onUpload: (file: File) => Promise<void>;
  onUploaded?: () => void;
}

export function UploadZone({ onUpload, onUploaded }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const chooseFile = (files: FileList | null) => {
    const selected = files?.[0] ?? null;
    setFile(selected);
    setUploadedName(null);
    setError(null);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
      setUploadedName(file.name);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(`Uploaded ${file.name}`);
      onUploaded?.();
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Document upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          chooseFile(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50/50",
        )}
      >
        <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-500 shadow-sm">
          <UploadCloud className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900">Drop one file here to upload</p>
        <p className="mt-1 text-xs text-slate-500">
          PDF, Word, Excel, PNG, JPG, TXT, or ZIP · maximum 10 MB
        </p>
        <input
          ref={inputRef}
          aria-label="Choose document"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip"
          className="hidden"
          onChange={(event) => chooseFile(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </Button>
      </div>

      {(file || uploadedName) && (
        <div className="flex items-center gap-3 rounded-md border border-slate-200 p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : uploadedName ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {file?.name ?? uploadedName}
            </p>
            <p className="text-xs text-slate-500">
              {file ? formatFileSize(file.size) : "Uploaded"}
            </p>
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setUploadedName(null);
                setError(null);
              }}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              aria-label="Clear selected file"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="button" disabled={!file || uploading} onClick={() => void upload()}>
        {uploading ? "Uploading…" : "Upload file"}
      </Button>
    </div>
  );
}
