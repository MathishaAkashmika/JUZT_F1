import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['www.formula1.com', 'media.formula1.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
