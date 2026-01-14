import { UAParser } from "ua-parser-js"

// 1. Let Rollup swap this variable based on the build flag
const CLOUDFLARE_URL = process.env.CLOUDFLARE_URL
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

    const org = (await res.json()) as any
    const maxAge = convertToSeconds(
      org.cookieLifetimeValue,
      org.cookieLifetimeUnit
    )

    return {
      maxAge,
      affiliateData: {
        code,
        commissionType: org.commissionType,
        commissionValue: org.commissionValue,
        commissionDurationValue: org.commissionDurationValue,
        commissionDurationUnit: org.commissionDurationUnit,
        attributionModel: org.attributionModel,
      },
    }
  } catch (err) {
    console.error("RefEarn: Error fetching org config", err)
  }
}

function getReferralCode(): string | null {
  const botPattern = /bot|googlebot|crawler|spider|robot|crawling/i
  if (botPattern.test(navigator.userAgent)) return null

  const urlParams = new URLSearchParams(window.location.search)
  for (const key of REF_KEYS) {
    if (urlParams.has(key)) return urlParams.get(key)
  }
  return null
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
  if (!navigator.sendBeacon(TRACKING_ENDPOINT, payload)) {
    fetch(TRACKING_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  }
}

// Execution Logic
const refCode = getReferralCode()
const trackedCode = getCookieValue("refearnapp_affiliate_click_tracked")

if (refCode) {
  storeRefCode(refCode).then((result) => {
    if (!result) return
    const { maxAge, affiliateData } = result

    const isFirstClickMatch =
      affiliateData.attributionModel === "FIRST_CLICK" && !trackedCode
    const isLastClickMatch =
      affiliateData.attributionModel === "LAST_CLICK" && trackedCode !== refCode

    if (isFirstClickMatch || isLastClickMatch) {
      sendTrackingData({
        ref: refCode,
        referrer: document.referrer,
        url: window.location.origin + window.location.pathname,
        host: window.location.hostname,
        ...getDeviceInfo(),
      })

      setCookie(
        "refearnapp_affiliate_cookie",
        JSON.stringify(affiliateData),
        maxAge
      )
      setCookie("refearnapp_affiliate_click_tracked", refCode, maxAge)
    }
  })
}
