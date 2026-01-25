// app/api/auth/google/route.ts
import { NextResponse } from "next/server"
import { getBaseUrl } from "@/lib/server/getBaseUrl"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const type = url.searchParams.get("type") || "organization" // "organization" | "affiliate"
  const orgId = url.searchParams.get("orgId") || undefined
  const rememberMe = url.searchParams.get("rememberMe") === "true"
  const page = url.searchParams.get("page") || "login"
  const txn = url.searchParams.get("txn") || undefined
  const baseUrl = await getBaseUrl()
  const state = encodeURIComponent(
    JSON.stringify({ type, orgId, rememberMe, baseUrl, page, txn })
  )
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state,
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return NextResponse.redirect(authUrl)
}
