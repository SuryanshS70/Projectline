import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterToolbar({
  search,
  onSearchChange,
  children,
  className,
  placeholder = "Search...",
}: {
  search: string;
  onSearchChange: (v: string) => void;
  children?: ReactNode;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {children}
    </div>
  );
}
