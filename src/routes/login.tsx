import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Wrench } from "lucide-react";
import { setSession } from "@/lib/session";
import type { Role } from "@/data/types";

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

  const goto = (role: Role) => {
    setSession(role);
    navigate({ to: `/${role}/dashboard` });
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
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                goto("client");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="text-sm font-normal text-slate-600">
                  Remember me on this device
                </Label>
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs uppercase tracking-wide text-slate-400">Demo</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-2">
              <Button type="button" variant="outline" onClick={() => goto("client")}>
                <Users className="mr-2 h-4 w-4" />
                Sign in as Client
              </Button>
              <Button type="button" variant="outline" onClick={() => goto("vendor")}>
                <Wrench className="mr-2 h-4 w-4" />
                Sign in as Vendor
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Demo environment — no real credentials required.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
