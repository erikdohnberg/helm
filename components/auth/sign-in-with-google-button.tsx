"use client";

import { signIn } from "next-auth/react";

export function SignInWithGoogleButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        // #region agent log
        fetch("http://127.0.0.1:7244/ingest/20b842f1-c46c-43d8-b6a9-d39f4fd0e0d7", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "sign-in-with-google-button.tsx:onClick",
            message: "Sign in with Google clicked; calling signIn",
            data: { provider: "google", callbackUrl: "/quarter" },
            timestamp: Date.now(),
            hypothesisId: "H1",
          }),
        }).catch(() => {});
        // #endregion
        try {
          const result = await signIn("google", { callbackUrl: "/quarter" });
          // #region agent log
          fetch("http://127.0.0.1:7244/ingest/20b842f1-c46c-43d8-b6a9-d39f4fd0e0d7", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "sign-in-with-google-button.tsx:afterSignIn",
              message: "signIn promise settled",
              data: {
                hasResult: result != null,
                ok: result ? (result as { ok?: boolean }).ok : undefined,
                error: result ? (result as { error?: string }).error : undefined,
              },
              timestamp: Date.now(),
              hypothesisId: "H2",
            }),
          }).catch(() => {});
          // #endregion
        } catch (e) {
          // #region agent log
          fetch("http://127.0.0.1:7244/ingest/20b842f1-c46c-43d8-b6a9-d39f4fd0e0d7", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "sign-in-with-google-button.tsx:catch",
              message: "signIn threw",
              data: {
                name: e instanceof Error ? e.name : "unknown",
              },
              timestamp: Date.now(),
              hypothesisId: "H2",
            }),
          }).catch(() => {});
          // #endregion
        }
      }}
      className="inline-flex min-w-[210px] items-center justify-center rounded-xl bg-brass px-7 py-4 text-base font-medium text-white shadow-[0_14px_34px_rgba(194,168,120,0.35)] transition-all hover:translate-y-[-1px] hover:bg-brass/90"
    >
      Sign in with Google
    </button>
  );
}
