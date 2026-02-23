import type { NextConfig } from "next"
const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        has: [
          {
            type: "host",
            value: "origin.refearnapp.com",
          },
        ],
        source: "/",
        destination: "https://refearnapp.com",
        permanent: true,
      },
    ]
  },
  output: isSelfHosted ? "standalone" : undefined,
  trailingSlash: false,
  experimental: {
    serverActions: {
      allowedOrigins: isSelfHosted
        ? [process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000"]
        : ["refearnapp.com", "www.refearnapp.com", "origin.refearnapp.com"],
    },
  },
}

export default nextConfig
