let baseUrl = "https://refearnapp.com";

export function initRefearnapp(url: string) {
  if (!url) return;
  let cleanedUrl = url.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(cleanedUrl)) {
    cleanedUrl = `https://${cleanedUrl}`;
  }
  baseUrl = cleanedUrl;
}

// Internal helper to read the cookie
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameLenPlus = name.length + 1;
  return (
    document.cookie
      .split(";")
      .map((c) => c.trim())
      .filter((cookie) => cookie.substring(0, nameLenPlus) === `${name}=`)
      .map((cookie) => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null
  );
}

export async function trackSignup(email: string) {
  try {
    const cookieName = "refearnapp_affiliate_cookie";
    const rawData = getCookie(cookieName);

    const affiliateData = rawData ? JSON.parse(rawData) : null;
    if (!affiliateData) return { success: false, error: "No affiliate data found" };

    // 1. Calculate how much time is left on the original cookie
    let maxAge = 2592000; // Default 30 days
    if (affiliateData.expiresAt) {
      const remainingMs = affiliateData.expiresAt - Date.now();
      maxAge = Math.floor(remainingMs / 1000);

      if (maxAge <= 0) return { success: false, error: "Cookie already expired" };
    }

    // 2. Add email to the data
    const updatedData = { ...affiliateData, email: email.toLowerCase() };
    const stringifiedData = JSON.stringify(updatedData);

    // 3. Overwrite the cookie LOCALLY with the original remaining time
    // We use SameSite=Lax for compatibility and apply the calculated maxAge
    document.cookie = `${cookieName}=${encodeURIComponent(stringifiedData)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;

    // 4. Sync to Worker
    const res = await fetch(`${baseUrl}/track-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        manualCookieData: stringifiedData
      }),
      credentials: "include",
    });

    return await res.json();
  } catch (err) {
    console.error("Refearnapp Tracking Error:", err);
    return { success: false, error: "Network or Configuration Error" };
  }
}