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
 typescript: {
  ignoreBuildErrors: true,
 }
};

export default nextConfig;
