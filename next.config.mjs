/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/app',
        destination: '/app/index.html',
      },
      {
        source: '/app/',
        destination: '/app/index.html',
      },
    ];
  },
};

export default nextConfig;
