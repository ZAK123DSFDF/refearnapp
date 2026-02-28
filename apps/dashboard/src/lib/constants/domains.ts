// @/lib/constants/domains.ts
/**
 * Helper to safely extract hostname regardless of input format
 */
const safeGetHostname = (input: string): string | null => {
  if (!input) return null
  try {
    // If it's a URL (starts with http), use URL parser
    if (input.includes("://")) {
      return new URL(input).hostname.toLowerCase()
    }
    // Otherwise, assume it's a domain and trim any trailing slashes/whitespace
    return input.split("/")[0].toLowerCase().trim()
  } catch (e) {
    return null
  }
}
/**
 * Parses the comma-separated reserved subdomains from ENV.
 * Example: NEXT_PUBLIC_RESERVED_SUBDOMAINS="api,dashboard,assets,www,origin"
 */
const getReservedSubdomains = (): string[] => {
  const envValue = process.env.NEXT_PUBLIC_RESERVED_SUBDOMAINS || ""
  return envValue
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s !== "")
}

/**
 * Extracts hostnames from primary system URLs and domains.
 */
const getSystemBaseDomains = (): string[] => {
  const domains = new Set<string>()
  const rawInputs = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.REDIRECTION_URL,
    process.env.EMAIL_DOMAIN,
  ]

  rawInputs.forEach((input) => {
    const hostname = safeGetHostname(input || "")
    if (hostname) domains.add(hostname)
  })

  return Array.from(domains)
}

export const isReservedDomain = (hostname: string) => {
  const normalized = hostname.toLowerCase().trim()

  const baseDomains = getSystemBaseDomains()
  const reservedSubdomains = getReservedSubdomains()

  // 1. Match against Base Domains (e.g., voteflow.xyz, origin.voteflow.xyz)
  if (baseDomains.includes(normalized)) {
    return true
  }

  // 2. Match against "www" versions of Base Domains
  if (baseDomains.some((domain) => normalized === `www.${domain}`)) {
    return true
  }

  // 3. Match against Subdomain patterns
  // This checks if the host is EXACTLY the subdomain (for local/relative)
  // or if it's a subdomain of any of our configured base domains.
  return reservedSubdomains.some((sub) => {
    const isExactMatch = normalized === sub
    const isSubOfSystem = baseDomains.some(
      (domain) => normalized === `${sub}.${domain}`
    )
    return isExactMatch || isSubOfSystem
  })
}
