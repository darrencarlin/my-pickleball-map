import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "pub-d36b4370ca3844a7b3b8f11ba32dbe39.r2.dev",
      },
    ],
  },
};

export default nextConfig;
