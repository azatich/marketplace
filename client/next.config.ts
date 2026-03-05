import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mekfzejktvticnuhhojl.supabase.co',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
