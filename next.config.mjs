/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  transpilePackages: ['react-icons'],
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
