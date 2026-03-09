/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression for better performance
  compress: true,

  // Optimize React in production
  reactStrictMode: true,

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

  // Headers for security and caching
  async headers() {
    return [
      // ── Security headers for ALL routes ──────────────────────────
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Limit referrer information leakage
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Enforce HTTPS (1 year, include subdomains)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Prevent XSS
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      // ── Long-lived cache for static assets ───────────────────────
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

