"use client";

import type { ReactNode } from "react";

import { useSession } from "next-auth/react";

import { LoadingRecord } from "@/components/ui/table";

export function AppSessionReady({ children }: { children: ReactNode }) {
  const { status } = useSession();

  /* Loading is stated, not spun. "Reading the record…" is a fact about what
   * Helm is doing; a spinner is decoration. */
  if (status === "loading") {
    return (
      <div className="max-w-prose">
        <LoadingRecord />
      </div>
    );
  }

  return <>{children}</>;
}
