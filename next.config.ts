import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        pathname: '/**',
      },
      {
        // Allow any other domains (fallback)
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        // Allow HTTP for local/dev
        protocol: 'http',
        hostname: '**',
        pathname: '/**',
      },
    ],
    // Add these for production stability
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
