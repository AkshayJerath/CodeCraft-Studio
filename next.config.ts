import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Environment variables for code execution service
  env: {
    NEXT_PUBLIC_CODE_EXECUTOR_URL: process.env.NEXT_PUBLIC_CODE_EXECUTOR_URL || 'http://localhost:3001',
  },
};

export default nextConfig;