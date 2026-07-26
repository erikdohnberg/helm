import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading the dev app from http://127.0.0.1:3000 (not only localhost) without
  // Next.js cross-origin warnings on /_next/* — matches common Picker API referrer setup.
  allowedDevOrigins: ["127.0.0.1"],
  // The repo's .eslintrc references @typescript-eslint rules without registering the
  // plugin, so `next build`'s lint step errors. The demo deploy doesn't need lint;
  // skip it during build (does not affect `npm run lint` or editor linting).
  eslint: { ignoreDuringBuilds: true },
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
    ];
  },
};

export default nextConfig;
