import type { NextConfig } from "next"

const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"

// --- Only used for Cloud version logic ---
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
const redirectFromUrl = process.env.REDIRECTION_URL

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname
  } catch {
    return url.replace(/https?:\/\//, "").split("/")[0]
  }
}

const baseHost = getHostname(baseUrl)
const redirectFromHost = redirectFromUrl ? getHostname(redirectFromUrl) : null

const nextConfig: NextConfig = {
  // 1. Redirects: Only active if NOT self-hosted
  async redirects() {
    if (!isSelfHosted && redirectFromHost && baseUrl) {
      return [
        {
          has: [
            {
              type: "host",
              value: redirectFromHost,
            },
          ],
          source: "/",
          destination: baseUrl,
          permanent: true,
        },
      ]
    }
    return []
  },

  // 2. Output Mode
  output: isSelfHosted ? "standalone" : undefined,

  // 3. Trailing Slash (Set to false to avoid 308 loops with Cloudflare)
  trailingSlash: false,

  // 4. Server Actions Security
  experimental: {
    serverActions: {
      // For Self-Hosted, we trust the Worker. For Cloud, we restrict.
      allowedOrigins: isSelfHosted
        ? ["*"] // Allow the proxy to handle origin validation
        : [
            baseHost,
            `*.${baseHost}`,
            `**.${baseHost}`,
            ...(redirectFromHost ? [redirectFromHost] : []),
          ],
    },
  },
}

export default nextConfig
