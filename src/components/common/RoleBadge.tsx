import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role } from "@/data/types";

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        role === "client"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
        className,
      )}
    >
      {role === "client" ? "Client" : "Vendor"}
    </Badge>
  );
}
