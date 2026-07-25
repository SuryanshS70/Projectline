import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/format";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done";
}

interface Props {
  categories?: string[];
  onUploaded?: (file: {
    name: string;
    size: number;
    category: string;
    description: string;
  }) => void;
  showVisibility?: boolean;
}

export function UploadZone({
  categories = ["General", "Design", "Specification", "Reports", "QA", "Operations"],
  onUploaded,
  showVisibility = false,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [category, setCategory] = useState(categories[0]);
  const [visibility, setVisibility] = useState<"internal" | "client_visible">("client_visible");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      Array.from(files).forEach((f) => {
        const id = crypto.randomUUID();
        setItems((prev) => [
          ...prev,
          { id, name: f.name, size: f.size, progress: 0, status: "uploading" },
        ]);

        // Simulated upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 22 + 8;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setItems((prev) =>
              prev.map((it) => (it.id === id ? { ...it, progress: 100, status: "done" } : it)),
            );
            toast.success(`Uploaded ${f.name}`);
            onUploaded?.({ name: f.name, size: f.size, category, description });
          } else {
            setItems((prev) => prev.map((it) => (it.id === id ? { ...it, progress } : it)));
          }
        }, 250);
      });
    },
    [category, description, onUploaded],
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50/50",
        )}
      >
        <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-500 shadow-sm">
          <UploadCloud className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900">Drop files here to upload</p>
        <p className="mt-1 text-xs text-slate-500">or click to browse — simulated upload only</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {showVisibility ? (
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client_visible">Client visible</SelectItem>
                <SelectItem value="internal">Internal only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Version (optional)</Label>
            <Input placeholder="e.g. v1.2" />
          </div>
        )}
        <div className="md:col-span-2 space-y-2">
          <Label>Description (optional)</Label>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center gap-3 rounded-md border border-slate-200 p-3"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
                {it.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{it.name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span>{formatFileSize(it.size)}</span>
                  <span>·</span>
                  <span>{it.status === "done" ? "Uploaded" : `${Math.round(it.progress)}%`}</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${it.progress}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label={`Remove ${it.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
