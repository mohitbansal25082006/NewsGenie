import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (updated for Next.js 15.5+)
  turbopack: {
    // Use rules instead of loaders (new format)
    rules: {
      '*.svg': ['@svgr/webpack'],
    },
  },
  
  // Image optimization for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // swcMinify is enabled by default in Next.js 15, no need to specify
  // Removed: swcMinify: true,
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here if needed in future
    // serverComponentsExternalPackages: ['@prisma/client'],
  },
};

export default nextConfig;