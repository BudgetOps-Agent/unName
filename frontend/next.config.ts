import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
