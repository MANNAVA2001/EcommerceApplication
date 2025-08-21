/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
    NEXT_PUBLIC_RECOMMENDATION_URL: process.env.NEXT_PUBLIC_RECOMMENDATION_URL || 'http://localhost:5001/recommendations',
  },
  images: {
    domains: ['localhost', '127.0.0.1', '*.azurewebsites.net'],
    unoptimized: true,
  },

  output: 'standalone',
  
  trailingSlash: false,

};

module.exports = nextConfig;
