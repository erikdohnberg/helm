import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/", "/landing", "/thanks"];
const AUTH_API_PREFIX = "/api/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith(AUTH_API_PREFIX);
  const isApp = pathname.startsWith("/quarter") || pathname.startsWith("/outcomes") || pathname.startsWith("/settings");
  const isOnboarding = pathname.startsWith("/onboarding");
  const protectedPath = isApp || isOnboarding;

  const session = req.auth;
  const isLoggedIn = !!session?.user;

  if (isPublic && !isLoggedIn) {
    return NextResponse.next();
  }

  if (isPublic && isLoggedIn) {
    const needsOnboarding = (session?.user as { needsOnboarding?: boolean })?.needsOnboarding;
    const redirectTo = needsOnboarding ? "/onboarding/org-setup" : "/quarter";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  if (protectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/landing", req.url));
  }

  const needsOnboarding = (session?.user as { needsOnboarding?: boolean })?.needsOnboarding;
  if (isOnboarding && isLoggedIn && !needsOnboarding) {
    return NextResponse.redirect(new URL("/quarter", req.url));
  }
  if (isApp && isLoggedIn && needsOnboarding) {
    return NextResponse.redirect(new URL("/onboarding/org-setup", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Only run auth middleware on known app/marketing paths (avoids NextAuth on internal paths like /_app).
  matcher: [
    "/",
    "/landing",
    "/thanks",
    "/quarter",
    "/quarter/:path*",
    "/outcomes",
    "/outcomes/:path*",
    "/settings",
    "/settings/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/api/auth/:path*",
  ],
};
