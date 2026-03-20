"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { SignInWithGoogleButton } from "@/components/auth/sign-in-with-google-button";
import { getPostAuthRoute } from "@/lib/routing/post-auth";

const brassButtonClass =
  "inline-flex min-w-[210px] items-center justify-center rounded-xl bg-brass px-7 py-4 text-base font-medium text-white shadow-[0_14px_34px_rgba(194,168,120,0.35)] transition-all hover:translate-y-[-1px] hover:bg-brass/90";

export function LandingHeroCta() {
  const { status } = useSession();

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      {status === "loading" ? (
        <p className="text-sm text-white/85" aria-live="polite">
          Loading…
        </p>
      ) : status === "authenticated" ? (
        <>
          <Link href={getPostAuthRoute()} className={brassButtonClass}>
            Open app
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/landing" })}
            className="text-sm text-white/90 underline decoration-white/40 underline-offset-4 hover:text-white"
          >
            Sign out
          </button>
        </>
      ) : (
        <SignInWithGoogleButton />
      )}
      <Link
        href="#waitlist"
        className="text-sm text-white/90 underline hover:text-white"
      >
        Subscribe to email list
      </Link>
      <p className="text-sm text-white/85">Currently in private prototype.</p>
    </div>
  );
}
