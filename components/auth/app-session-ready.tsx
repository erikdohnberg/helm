"use client";

import type { ReactNode } from "react";

import { useSession } from "next-auth/react";

export function AppSessionReady({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6"
        aria-busy
        aria-live="polite"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
