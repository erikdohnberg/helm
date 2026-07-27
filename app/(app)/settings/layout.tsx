import { SettingsTabs } from "@/components/settings/settings-tabs";
import { RecordTitle } from "@/components/ui/card";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2.5">
        <RecordTitle as="h1" level="page">
          Settings
        </RecordTitle>
        <p className="max-w-prose text-muted-foreground">
          The organization, the people in it, and what Helm is allowed to read.
        </p>
      </div>
      <SettingsTabs />
      <div className="min-h-[200px]">{children}</div>
    </div>
  );
}
