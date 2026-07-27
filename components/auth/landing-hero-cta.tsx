"use client";

import Link from "next/link";

import { signOut, useSession } from "next-auth/react";

import { SignInWithGoogleButton } from "@/components/auth/sign-in-with-google-button";
import { Button } from "@/components/ui/button";
import { Observed } from "@/components/ui/chip";
import { getPostAuthRoute } from "@/lib/routing/post-auth";

export function LandingHeroCta() {
  const { status } = useSession();

  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex flex-wrap items-center gap-3">
        {status === "loading" ? (
          <p className="text-help text-muted-foreground" aria-live="polite">
            Reading the record…
          </p>
        ) : status === "authenticated" ? (
          <>
            <Link href={getPostAuthRoute()}>
              <Button size="lg">Read the quarter</Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/landing" })}
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <SignInWithGoogleButton />
            <Link href="#waitlist">
              <Button variant="outline" size="lg">
                Follow the build
              </Button>
            </Link>
          </>
        )}
      </div>
      <Observed className="text-help">
        In private prototype. Nothing here reads your workspace yet.
      </Observed>
    </div>
  );
}
