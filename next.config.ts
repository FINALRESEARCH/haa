import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Everything an editor uploads is served from Sanity's asset CDN.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
