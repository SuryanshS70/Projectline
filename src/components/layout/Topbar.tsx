import { Bell, Menu, Search } from "lucide-react";
import type { Role } from "@/data/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { RoleBadge } from "@/components/common/RoleBadge";
import { demoClient, demoVendor } from "@/data/users";
import { getOrgById } from "@/data/organisations";
import { notificationsForRole } from "@/data/notifications";
import { Link, useRouterState } from "@tanstack/react-router";

interface Props {
  role: Role;
  onOpenSidebar: () => void;
}

const titleFor = (path: string): string => {
  if (path.includes("/dashboard")) return "Dashboard";
  if (path.match(/projects\/[^/]+/)) return "Project workspace";
  if (path.includes("/projects")) return "Projects";
  if (path.includes("/documents")) return "Documents";
  if (path.includes("/notifications")) return "Notifications";
  if (path.includes("/settings")) return "Settings";
  return "";
};

export function Topbar({ role, onOpenSidebar }: Props) {
  const user = role === "client" ? demoClient : demoVendor;
  const org = getOrgById(user.organisationId);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notificationsForRole(role).filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <h2 className="truncate text-sm font-semibold text-slate-700 sm:text-base">
        {titleFor(pathname)}
      </h2>

      <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search projects, documents..." className="pl-9" />
      </div>

      <Link
        to={`/${role}/notifications`}
        className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        aria-label={`Notifications, ${unread} unread`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{org?.name}</p>
        </div>
        <UserAvatar name={user.name} />
        <RoleBadge role={role} className="hidden sm:inline-flex" />
      </div>
    </header>
  );
}
