import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
