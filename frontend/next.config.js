/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: process.env.API_INTERNAL_URL || 'http://api:8080/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
