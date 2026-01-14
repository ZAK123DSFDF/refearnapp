/**
 * Decodes a JWT payload without an external library.
 * Safe for use in the browser.
 */
export function decodeJwt(token: string | null | undefined) {
  if (!token) return null
  try {
    const base64Url = token.split(".")[1] // Get the payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Failed to decode JWT:", error)
    return null
  }
}
