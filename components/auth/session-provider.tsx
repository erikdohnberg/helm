"use client";

import type { ReactNode } from "react";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * Pin Auth.js client routes to `/api/auth`. Otherwise `basePath` is derived from
 * `NEXTAUTH_URL`’s pathname; values like `http://localhost:3000/*` (wildcard
 * patterns copied from API-key docs) become `/%2A` and break session fetch
 * (`ClientFetchError: Failed to fetch`).
 */
export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session?: Session | null;
}) {
  return (
    <NextAuthSessionProvider basePath="/api/auth" session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
