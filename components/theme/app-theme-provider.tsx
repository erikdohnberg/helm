"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

import { ThemeProvider } from "next-themes";

import { isMarketingPath } from "@/lib/routing/marketing-paths";

type Props = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: Props) {
  const pathname = usePathname();
  const forcedTheme = isMarketingPath(pathname) ? "light" : undefined;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="helm-theme"
      forcedTheme={forcedTheme}
    >
      {children}
    </ThemeProvider>
  );
}
