import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
 async rewrites() {
    return [
      {
        source: "/dashboard/:path*",
        destination: "/dashboard", 
      },
    ]
 },
};

export default nextConfig;
