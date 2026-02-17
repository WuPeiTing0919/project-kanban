import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/project-kanban",
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
