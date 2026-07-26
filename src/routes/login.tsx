import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Users, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { authStore } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Projectline" },
      {
        name: "description",
        content: "Sign in to Projectline to manage your projects and deliverables.",
      },
      { property: "og:title", content: "Sign in — Projectline" },
      {
        property: "og:description",
        content: "Sign in to Projectline to manage your projects and deliverables.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await authStore.login(email, password);
      await navigate({
        to: user.role === "CLIENT" ? "/client/dashboard" : "/vendor/dashboard",
      });
    } catch (loginError) {
      setError(
        loginError instanceof ApiError
          ? loginError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (role: "CLIENT" | "VENDOR") => {
    setEmail(role === "CLIENT" ? "client@example.com" : "vendor@example.com");
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-900 text-lg font-bold text-white">
            PM
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Sign in to Projectline</h1>
          <p className="mt-1 text-sm text-slate-500">
            Delivery platform for client and vendor teams
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked disabled />
                <Label htmlFor="remember" className="text-sm font-normal text-slate-600">
                  Remember me on this device
                </Label>
              </div>
              {error && (
                <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs uppercase tracking-wide text-slate-400">Demo</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-2">
              <Button type="button" variant="outline" onClick={() => fillDemoCredentials("CLIENT")}>
                <Users className="mr-2 h-4 w-4" />
                Use Client credentials
              </Button>
              <Button type="button" variant="outline" onClick={() => fillDemoCredentials("VENDOR")}>
                <Wrench className="mr-2 h-4 w-4" />
                Use Vendor credentials
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Development accounts only — choose an account, then sign in.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
