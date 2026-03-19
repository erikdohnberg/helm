import type { Session } from "next-auth";
import type { GoogleIdentityDemoState } from "@/lib/mock/mockData";

export function getGoogleIdentityFromSession(
  session: Session | null,
  status: "loading" | "authenticated" | "unauthenticated"
): GoogleIdentityDemoState {
  if (status !== "authenticated") {
    return { isSignedInWithGoogle: false, googleAccountEmail: null };
  }
  const email = session?.user?.email ?? null;
  if (!email) {
    return { isSignedInWithGoogle: false, googleAccountEmail: null };
  }
  return { isSignedInWithGoogle: true, googleAccountEmail: email };
}
