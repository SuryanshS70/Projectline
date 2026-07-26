import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { authStore, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    await authStore.restore();
    const user = authStore.getSnapshot().user;

    if (!user) throw redirect({ to: "/login" });

    const requestedRole = location.pathname.startsWith("/vendor") ? "VENDOR" : "CLIENT";
    if (user.role !== requestedRole) {
      throw redirect({
        to: user.role === "CLIENT" ? "/client/dashboard" : "/vendor/dashboard",
      });
    }

    return { user };
  },
  pendingMs: 0,
  pendingComponent: AuthLoadingScreen,
  component: AppLayout,
});

function AuthLoadingScreen() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-slate-50 px-6 py-16">
      <ListSkeleton rows={4} />
    </div>
  );
}

function AppLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      void navigate({ to: "/login" });
    }
  }, [isLoading, navigate, user]);

  if (!user) return <AuthLoadingScreen />;
  const role = user.role === "CLIENT" ? "client" : "vendor";

  return (
    <AppShell role={role}>
      <Outlet />
    </AppShell>
  );
}
