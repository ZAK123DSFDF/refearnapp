var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  initRefearnapp: () => initRefearnapp,
  trackSignup: () => trackSignup
});
module.exports = __toCommonJS(index_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  initRefearnapp,
  trackSignup
});
