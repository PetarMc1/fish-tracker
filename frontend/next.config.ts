import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    API_KEY:
      process.env.API_KEY || process.env.API_KEY || "",
    API_URL:
      process.env.API_URL || "https://api.tracker.petarmc.com",
  },
};

export default nextConfig;
