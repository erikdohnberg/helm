"use client";

import { usePathname } from "next/navigation";

import { Tabs } from "@/components/ui/tabs";

const settingsTabs = [
  { id: "/settings/team", label: "Team", href: "/settings/team" },
  {
    id: "/settings/integrations",
    label: "Integrations",
    href: "/settings/integrations",
  },
  { id: "/settings/defaults", label: "Defaults", href: "/settings/defaults" },
  { id: "/settings/system", label: "System", href: "/settings/system" },
] as const;

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <Tabs label="Settings sections" tabs={settingsTabs} active={pathname} />
  );
}
