"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { getPostAuthRoute } from "@/lib/routing/post-auth";

export function SignInWithGoogleButton() {
  return (
    <Button
      size="lg"
      onClick={() => signIn("google", { redirectTo: getPostAuthRoute() })}
    >
      Sign in with Google
    </Button>
  );
}
