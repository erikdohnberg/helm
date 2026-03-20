import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPostAuthRoute } from "@/lib/routing/post-auth";

const PUBLIC_PATHS = ["/", "/landing", "/thanks"];
const AUTH_API_PREFIX = "/api/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Auth.js JSON routes must never redirect to HTML (e.g. SessionProvider fetch would parse <!DOCTYPE as JSON).
  if (pathname.startsWith(AUTH_API_PREFIX)) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isApp = pathname.startsWith("/quarter") || pathname.startsWith("/outcomes") || pathname.startsWith("/settings");
  const isOnboarding = pathname.startsWith("/onboarding");
  const protectedPath = isApp || isOnboarding;

  const session = req.auth;
  const isLoggedIn = !!session?.user;

  if (isPublic && !isLoggedIn) {
    return NextResponse.next();
  }

  if (isPublic && isLoggedIn) {
    return NextResponse.redirect(new URL(getPostAuthRoute(), req.url));
  }

  if (protectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/landing", req.url));
  }

  const needsOnboarding = (session?.user as { needsOnboarding?: boolean })?.needsOnboarding;
  if (isOnboarding && isLoggedIn && !needsOnboarding) {
    return NextResponse.redirect(new URL(getPostAuthRoute(), req.url));
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
