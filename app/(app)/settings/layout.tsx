import { SettingsTabs } from "@/components/settings/settings-tabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your team, integrations, and preferences.
        </p>
      </div>
      <SettingsTabs />
      <div className="min-h-[200px]">{children}</div>
    </div>
  );
}
