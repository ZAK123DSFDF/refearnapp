import type { NextConfig } from "next"

// const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
// const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
// // This is the specific host we want to catch and redirect FROM
// const redirectFromUrl = process.env.REDIRECTION_URL
//
// const getHostname = (url: string) => {
//   try {
//     return new URL(url).hostname
//   } catch {
//     // Fallback for strings without protocol
//     return url.replace(/https?:\/\//, "").split("/")[0]
//   }
// }
//
// const baseHost = getHostname(baseUrl)
// const redirectFromHost = redirectFromUrl ? getHostname(redirectFromUrl) : null

const nextConfig: NextConfig = {
  // async redirects() {
  //   // Only redirect if both URLs are provided and we are in self-hosted mode
  //   if (isSelfHosted && redirectFromHost && baseUrl) {
  //     return [
  //       {
  //         has: [
  //           {
  //             type: "host",
  //             // Matches the specific host provided in REDIRECTION_URL
  //             value: redirectFromHost,
  //           },
  //         ],
  //         source: "/",
  //         // Sends them to the root of your NEXT_PUBLIC_BASE_URL
  //         destination: baseUrl,
  //         permanent: true,
  //       },
  //     ]
  //   }
  //   return []
  // },
  //
  // output: isSelfHosted ? "standalone" : undefined,
  // trailingSlash: false,
  //
  // experimental: {
  //   serverActions: {
  //     // Use wildcards to allow any subdomain for Server Actions
  //     // This prevents the "No available server" / CSRF errors on /signup
  //     allowedOrigins: [
  //       baseHost,
  //       `*.${baseHost}`,
  //       `**.${baseHost}`,
  //       ...(redirectFromHost ? [redirectFromHost] : []),
  //     ],
  //   },
  // },
}

export default nextConfig
