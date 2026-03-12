"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsTabs = [
  { href: "/settings/team", label: "Team" },
  { href: "/settings/integrations", label: "Integrations" },
  { href: "/settings/defaults", label: "Defaults" },
  { href: "/settings/system", label: "System" },
] as const;

function SettingsTabLink({
  href,
  children,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2.5 text-sm font-medium transition-colors rounded-t-md -mb-px",
        isActive
          ? "bg-muted text-foreground border border-b-0 border-border"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </Link>
  );
}

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings sections" className="border-b border-border">
      <ul className="flex gap-0.5">
        {settingsTabs.map(({ href, label }) => (
          <li key={href}>
            <SettingsTabLink href={href} isActive={pathname === href}>
              {label}
            </SettingsTabLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
