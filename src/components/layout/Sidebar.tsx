import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, ArrowLeftRight } from "lucide-react";
import type { Role } from "@/data/types";
import { navFor } from "@/lib/nav";
import { UserAvatar } from "@/components/common/UserAvatar";
import { RoleBadge } from "@/components/common/RoleBadge";
import { getUserById, demoClient, demoVendor } from "@/data/users";
import { getOrgById } from "@/data/organisations";
import { clearSession, setSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  role: Role;
  onNavigate?: () => void;
}

export function Sidebar({ role, onNavigate }: Props) {
  const items = navFor(role);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const user = role === "client" ? demoClient : demoVendor;
  const org = getOrgById(user.organisationId);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <Link
        to="/"
        onClick={onNavigate}
        aria-label="Go to home"
        className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-5 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
      >
        <div className="grid h-8 w-8 place-items-center rounded-md bg-slate-900 text-sm font-bold text-white">
          PM
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">Projectline</p>
          <p className="truncate text-xs text-slate-500">Delivery platform</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-md bg-slate-50 p-3">
          <UserAvatar name={user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{org?.name}</p>
          </div>
          <RoleBadge role={role} />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              const next: Role = role === "client" ? "vendor" : "client";
              setSession(next);
              navigate({ to: `/${next}/dashboard` });
            }}
          >
            <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
            Switch role
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearSession();
              navigate({ to: "/login" });
            }}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

// Prevent unused import
void getUserById;
