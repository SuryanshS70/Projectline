import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/common/UserAvatar";
import { demoClient } from "@/data/users";
import { getOrgById } from "@/data/organisations";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/client/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Projectline" },
      { name: "description", content: "Manage your profile and preferences." },
    ],
  }),
  component: ClientSettings,
});

function ClientSettings() {
  return <SettingsPage user={demoClient} />;
}

export function SettingsPage({ user }: { user: typeof demoClient }) {
  const org = getOrgById(user.organisationId);
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Profile and preferences" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-none lg:col-span-2">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <UserAvatar name={user.name} size="lg" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">
                  {user.title} · {org?.name}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input defaultValue={user.name} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user.email} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input defaultValue={user.title} />
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <Input defaultValue={org?.name} disabled />
              </div>
            </div>
            <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-none">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {[
              "Email me on approval requests",
              "Email me on new uploads",
              "Email me on delayed milestones",
              "Weekly digest",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <Label className="text-sm font-normal text-slate-600">{label}</Label>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
