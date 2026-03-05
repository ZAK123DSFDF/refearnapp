// index.ts
var baseUrl = "https://refearnapp.com";
function initRefearnapp(url) {
  if (!url) return;
  let cleanedUrl = url.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(cleanedUrl)) {
    cleanedUrl = `https://${cleanedUrl}`;
  }
  baseUrl = cleanedUrl;
}
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const nameLenPlus = name.length + 1;
  return document.cookie.split(";").map((c) => c.trim()).filter((cookie) => cookie.substring(0, nameLenPlus) === `${name}=`).map((cookie) => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null;
}
async function trackSignup(email) {
  try {
    const cookieName = "refearnapp_affiliate_cookie";
    const rawData = getCookie(cookieName);
    const affiliateData = rawData ? JSON.parse(rawData) : null;
    if (!affiliateData) return { success: false, error: "No affiliate data found" };
    let maxAge = 2592e3;
    if (affiliateData.expiresAt) {
      const remainingMs = affiliateData.expiresAt - Date.now();
      maxAge = Math.floor(remainingMs / 1e3);
      if (maxAge <= 0) return { success: false, error: "Cookie already expired" };
    }
    const updatedData = { ...affiliateData, email: email.toLowerCase() };
    const stringifiedData = JSON.stringify(updatedData);
    document.cookie = `${cookieName}=${encodeURIComponent(stringifiedData)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    const res = await fetch(`${baseUrl}/track-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        manualCookieData: stringifiedData
      }),
      credentials: "include"
    });
    return await res.json();
  } catch (err) {
    console.error("Refearnapp Tracking Error:", err);
    return { success: false, error: "Network or Configuration Error" };
  }
}
export {
  initRefearnapp,
  trackSignup
};
