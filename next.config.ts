import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WARNING: Very permissive; consider restricting in production
    remotePatterns: [
      {
        // omit protocol to allow http and https
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
