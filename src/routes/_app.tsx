import { createFileRoute, Outlet, useRouterState, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import type { Role } from "@/data/types";

// Pathless layout applied to both /client/* and /vendor/*.
// The role is derived from the URL segment.
export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    // Protected-route placeholder. Codex will replace this with real auth.
    // For the demo we allow direct navigation but redirect if landing on /_app itself.
    if (location.pathname === "/" || location.pathname === "/_app") {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role: Role = pathname.startsWith("/vendor") ? "vendor" : "client";
  return (
    <AppShell role={role}>
      <Outlet />
    </AppShell>
  );
}
