// @/lib/constants/domains.ts

export const RESERVED_SUBDOMAINS = [
  "assets",
  "asset",
  "cdn",
  "api",
  "affiliate",
  "affiliates",
  "dashboard",
  "app",
  "www",
] as const

export const PRIMARY_DOMAIN = "refearnapp.com"

/**
 * Checks if a given hostname is a system-reserved domain.
 * Supports both "assets.refearnapp.com" and "assets" (if you're just checking prefix).
 */
export const isReservedDomain = (hostname: string) => {
  const normalized = hostname.toLowerCase().trim()

  // 1. Check if it's the root or www
  if (normalized === PRIMARY_DOMAIN || normalized === `www.${PRIMARY_DOMAIN}`) {
    return true
  }

  // 2. Check if it's any of our reserved subdomains
  return RESERVED_SUBDOMAINS.some(
    (sub) => normalized === `${sub}.${PRIMARY_DOMAIN}` || normalized === sub
  )
}
