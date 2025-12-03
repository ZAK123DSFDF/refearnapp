export function openEmailApp(email: string, isPreview?: boolean) {
  // 👉 Preview mode (Vercel preview deployments)
  if (isPreview) {
    window.open("https://mail.google.com", "_blank")
    return
  }

  const isDev = process.env.NODE_ENV === "development"

  // 👉 Local development
  if (isDev) {
    window.open("http://localhost:8025", "_blank")
    return
  }

  // 👉 Production mode: detect provider
  const domain = email.split("@")[1]?.toLowerCase()

  const providerUrls: Record<string, string> = {
    "gmail.com": "https://mail.google.com",
    "googlemail.com": "https://mail.google.com",
    "outlook.com": "https://outlook.live.com",
    "hotmail.com": "https://outlook.live.com",
    "live.com": "https://outlook.live.com",
    "yahoo.com": "https://mail.yahoo.com",
    "icloud.com": "https://www.icloud.com/mail",
    "me.com": "https://www.icloud.com/mail",
    "proton.me": "https://mail.proton.me",
  }

  const url = providerUrls[domain]

  if (url) {
    window.open(url, "_blank")
    return
  }

  // 👉 Unknown providers → fallback
  window.open(`mailto:${email}`, "_blank")
}
