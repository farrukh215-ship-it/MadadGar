import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use different build dir to avoid EPERM on locked .next folder
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  // Performance: enable compression, optimize fonts
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        pathname: '/storage/v1/**',
      },
    ],
  },
};

export default nextConfig;
