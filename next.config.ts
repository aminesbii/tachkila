import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A plain folder of static files: no server, no database, works fully offline.
  output: "export",
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
