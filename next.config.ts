import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading the dev app from http://127.0.0.1:3000 (not only localhost) without
  // Next.js cross-origin warnings on /_next/* — matches common Picker API referrer setup.
  allowedDevOrigins: ["127.0.0.1"],
  // Lint runs during the build. Besides the usual rules, .eslintrc carries the
  // design-system adherence checks — raw hex, off-system palettes, non-instrument
  // icon sets, banned vocabulary — so a build is the last place a screen can
  // quietly leave the system. See lib/design/README.md.
  experimental: {
    // Smaller client chunks for next-auth/react (helps avoid dev ChunkLoadError timeouts on slow disks).
    optimizePackageImports: ["next-auth/react"],
  },
  async rewrites() {
    return [
      // The drift model scorecard is a self-contained static page (its own fonts,
      // tokens and CSS from the Erik Dohnberg design system) served from /public,
      // so it stays out of the app's Tailwind layer. The rewrite gives it a clean
      // shareable URL. It is deliberately outside middleware's matcher, so it is
      // public and does not bounce signed-in visitors into the app.
      { source: "/scorecard", destination: "/scorecard.html" },
      // The Helm design system is likewise self-contained static HTML in /public,
      // reachable at /design-system/index.html by default; this gives it a clean
      // URL. Also outside the middleware matcher, so it stays public.
      { source: "/design-system", destination: "/design-system/index.html" },
    ];
  },
};

export default nextConfig;
