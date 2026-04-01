import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // CI runs lint explicitly, so builds can stay focused on deployability.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
