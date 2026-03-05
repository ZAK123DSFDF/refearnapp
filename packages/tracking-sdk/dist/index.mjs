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
async function trackSignup(email) {
  try {
    const res = await fetch(`${baseUrl}/track-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include"
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, status: res.status, ...errorData };
    }
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
