import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/data/types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export function navFor(role: Role): NavItem[] {
  const base = `/${role}`;
  return [
    { label: "Dashboard", to: `${base}/dashboard`, icon: LayoutDashboard },
    { label: "Projects", to: `${base}/projects`, icon: FolderKanban },
    { label: "Documents", to: `${base}/documents`, icon: FileText },
    { label: "Notifications", to: `${base}/notifications`, icon: Bell },
    { label: "Settings", to: `${base}/settings`, icon: Settings },
  ];
}
