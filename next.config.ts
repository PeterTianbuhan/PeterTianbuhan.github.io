import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
