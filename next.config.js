/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS hosts for sponsor logos
      },
    ],
  },
};

module.exports = nextConfig;
