import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep browser requests on the frontend origin. The destination is fixed by
  // server configuration; request parameters cannot choose another upstream.
  async rewrites() {
    const apiBase = (
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://appsuite.butterflytech.io/api"
    ).replace(/\/+$/, "");
    return [
      {
        source: "/backend-api/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
