import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 2 MB avatars + multipart overhead
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
