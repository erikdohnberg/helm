"use client";

import { signIn } from "next-auth/react";

export function SignInWithGoogleButton() {
  return (
    <button
      type="button"
      onClick={() =>
        signIn("google", { callbackUrl: "/quarter" })
      }
      className="inline-flex min-w-[210px] items-center justify-center rounded-xl bg-brass px-7 py-4 text-base font-medium text-white shadow-[0_14px_34px_rgba(194,168,120,0.35)] transition-all hover:translate-y-[-1px] hover:bg-brass/90"
    >
      Sign in with Google
    </button>
  );
}
