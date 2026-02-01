import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize Statsig Node Core SDK - it uses native Rust binaries
  serverExternalPackages: ["@statsig/statsig-node-core"],
  // Silence "multiple lockfiles" warning: use this repo as Turbopack root
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "secure-content.meetupstatic.com",
      },
    ],
  },
};

export default nextConfig;
