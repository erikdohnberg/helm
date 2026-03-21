import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading the dev app from http://127.0.0.1:3000 (not only localhost) without
  // Next.js cross-origin warnings on /_next/* — matches common Picker API referrer setup.
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    // Smaller client chunks for next-auth/react (helps avoid dev ChunkLoadError timeouts on slow disks).
    optimizePackageImports: ["next-auth/react"],
  },
};

export default nextConfig;
