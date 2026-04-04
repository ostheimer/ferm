import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/internal/db-sync": ["./drizzle/**/*"]
  }
};

export default nextConfig;
