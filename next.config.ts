import type { NextConfig } from "next"

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
  trailingSlash: false,
  experimental: {
    serverActions: {
      allowedOrigins: [
        "refearnapp.com",
        "www.refearnapp.com",
        "origin.refearnapp.com",
      ],
    },
  },
}

export default nextConfig
