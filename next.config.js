/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      // Google user avatars (OAuth)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Gravatar
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
      // Generic placeholder / dev usage
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Allow SVG data URIs for Next/Image
  dangerouslyAllowSVG: true,

  // Strict mode for React
  reactStrictMode: true,

  // Compiler options
  compiler: {
    // Remove console.log in production (keep warn/error)
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["warn", "error"] }
        : false,
  },

  // Experimental features
  experimental: {
    // Server actions are stable in Next 14, but keep the flag for clarity
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

module.exports = nextConfig;
