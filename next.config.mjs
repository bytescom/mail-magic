/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem cache in development to prevent ENOENT
      // pack.gz corruption errors on Windows during hot reloads
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;


