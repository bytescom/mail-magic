/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression for better performance
  compress: true,

  // Optimize React in production
  reactStrictMode: true,

  // Optimize production bundle
  swcMinify: true,

  // Production source maps (disable for faster builds)
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Modern image formats
    minimumCacheTTL: 60, // Cache images for 60 seconds
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Optimize for common screen sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and small image sizes
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true, // Optimize CSS
    optimizePackageImports: ['lucide-react', 'sonner'], // Tree-shake these packages
  },

  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

