import type { NextConfig } from "next"
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
initOpenNextCloudflareForDev().then(() => console.log("initialized"))
const nextConfig: NextConfig = {
  trailingSlash: false,
}

export default nextConfig
