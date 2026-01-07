import { UAParser } from "ua-parser-js"
;(function () {
  const CLOUDFLARE_URL = "https://tracking-worker.zekariyasberihun8.workers.dev"
  const TRACKING_ENDPOINT = `${CLOUDFLARE_URL}/track`
  const ORGID_ENDPOINT = `${CLOUDFLARE_URL}/org`
  const REF_KEYS = ["ref", "aff", "via"]

  function convertToSeconds(value: number, unit: string): number {
    const unitToSeconds: Record<string, number> = {
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      month: 2592000,
      year: 31536000,
    }
    return value * (unitToSeconds[unit.toLowerCase()] || 86400)
  }
  function getCookieValue(name: string): string | null {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
    return value ? decodeURIComponent(value.split("=")[1]) : null
  }
  function setCookie(name: string, value: string, maxAge: number) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`
  }

  async function storeRefCode(code: string) {
    try {
      const res = await fetch(
        `${ORGID_ENDPOINT}?code=${encodeURIComponent(code)}`
      )
      if (!res.ok) throw new Error("Failed to fetch organization info")
      type OrgTrackingConfig = {
        cookieLifetimeValue: number
        cookieLifetimeUnit: string
        commissionType: "percentage" | "fixed"
        commissionValue: string | number
        commissionDurationValue: number
        commissionDurationUnit: string
        attributionModel: "FIRST_CLICK" | "LAST_CLICK"
      }
      const org = (await res.json()) as OrgTrackingConfig

      const {
        cookieLifetimeValue,
        cookieLifetimeUnit,
        commissionType,
        commissionValue,
        commissionDurationValue,
        commissionDurationUnit,
        attributionModel,
      } = org

      const maxAge = convertToSeconds(cookieLifetimeValue, cookieLifetimeUnit)

      const affiliateData = {
        code,
        commissionType,
        commissionValue,
        commissionDurationValue,
        commissionDurationUnit,
        attributionModel,
      }

      return { maxAge, affiliateData }
    } catch (err) {
      console.error("Failed to set affiliate cookie:", err)
    }
  }

  function getReferralCode(): string | null {
    const botPattern =
      /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebookcatalog|Facebot|Twitterbot|Pinterest|LinkedInBot|Slackbot|TelegramBot|WhatsApp|Snapchat|Discordbot|Mastodon|pinit/i
    if (botPattern.test(navigator.userAgent)) {
      console.log("RefEarn: Bot ignored")
      return null
    }
    const urlParams = new URLSearchParams(window.location.search)
    for (const key of REF_KEYS) {
      if (urlParams.has(key)) return urlParams.get(key)
    }
    return null
  }
  function getCookie(name: string) {
    return document.cookie.split("; ").find((row) => row.startsWith(name + "="))
  }

  function setTempClickCookie(maxAge: number, affiliateData: any) {
    setCookie(
      "refearnapp_affiliate_cookie",
      JSON.stringify(affiliateData),
      maxAge
    )
    setCookie("refearnapp_affiliate_click_tracked", affiliateData.code, maxAge)
  }
  function getDeviceInfo() {
    const parser = new UAParser()
    const result = parser.getResult()
    return {
      browser: result.browser.name,
      os: result.os.name,
      deviceType: result.device.type || "desktop",
    }
  }
  function sendTrackingData(data: any) {
    const payload = JSON.stringify(data)
    const sent = navigator.sendBeacon(TRACKING_ENDPOINT, payload)
    if (!sent) {
      fetch(TRACKING_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }
  }
  const refCode = getReferralCode()
  const trackedCode = getCookieValue("refearnapp_affiliate_click_tracked")
  if (refCode) {
    storeRefCode(refCode)
      .then((result) => {
        if (!result) return
        const { maxAge, affiliateData } = result
        if (
          (affiliateData.attributionModel === "FIRST_CLICK" &&
            !getCookie("refearnapp_affiliate_click_tracked")) ||
          (affiliateData.attributionModel === "LAST_CLICK" &&
            trackedCode !== refCode)
        ) {
          const cleanUrl = window.location.origin + window.location.pathname
          sendTrackingData({
            ref: refCode,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            url: cleanUrl,
            host: window.location.hostname,
            ...getDeviceInfo(),
          })

          setTempClickCookie(maxAge, affiliateData)
        }
      })
      .catch((err) => {
        console.error("Failed to process affiliate tracking:", err)
      })
  }
})()
