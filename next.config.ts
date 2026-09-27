import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "dodptt9f4zk9h.cloudfront.net",
      },
    ],
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
