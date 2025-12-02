export function openEmailApp(isPreview?: boolean) {
  if (isPreview) {
    window.open("https://mail.google.com", "_blank")
    return
  }

  const isDev = process.env.NODE_ENV === "development"

  if (isDev) {
    window.open("http://localhost:8025", "_blank")
    return
  }

  console.log("Production mode: open the user's email app.")
}
