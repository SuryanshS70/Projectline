import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "../client/settings";
import { demoVendor } from "@/data/users";

export const Route = createFileRoute("/_app/vendor/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Projectline" },
      { name: "description", content: "Manage your profile and preferences." },
    ],
  }),
  component: VendorSettings,
});

function VendorSettings() {
  return <SettingsPage user={demoVendor} />;
}
