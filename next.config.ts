import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static HTML export
  output: 'export',
  
  // Disable Image Optimization API since we are doing a static export
  images: {
    unoptimized: true,
  },

  // Note: headers() are NOT supported when using `output: 'export'`.
  // If you are hosting on Cloudflare or S3, you must configure these security headers
  // in your Cloudflare dashboard (Cloudflare Rules) or S3/CloudFront metadata instead.
  /*
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  */
};

export default nextConfig;
