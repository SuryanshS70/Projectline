import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStore } from "@/lib/auth";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    await authStore.restore();
    const user = authStore.getSnapshot().user;

    if (!user) throw redirect({ to: "/login" });
    throw redirect({
      to: user.role === "CLIENT" ? "/client/dashboard" : "/vendor/dashboard",
    });
  },
});
