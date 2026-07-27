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
  // The design system is static HTML in public/, so it is reachable at
  // /design-system/index.html by default. These give it clean URLs. It sits
  // outside the middleware matcher, so it needs no auth — same as /demo.
  async rewrites() {
    return [
      { source: "/design-system", destination: "/design-system/index.html" },
    ];
  },
};

export default nextConfig;
