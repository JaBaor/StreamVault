import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
