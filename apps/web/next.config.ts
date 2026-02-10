import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use different build dir to avoid EPERM on locked .next folder
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
};

export default nextConfig;
