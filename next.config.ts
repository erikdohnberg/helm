import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Smaller client chunks for next-auth/react (helps avoid dev ChunkLoadError timeouts on slow disks).
    optimizePackageImports: ["next-auth/react"],
  },
};

export default nextConfig;
