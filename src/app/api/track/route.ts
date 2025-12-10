import { affiliateClick, affiliateLink, organization } from "@/db/schema"
import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { shouldTrackUser } from "@/lib/server/shouldTrackUser"
import { getDB } from "@/db/drizzle"

// CORS headers for all origins
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Handle POST request with CORS
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const { ref: refCode, host } = data
    const db = await getDB()
    const [affiliateLinkRecord] = await db
      .select({
        linkId: affiliateLink.id,
        orgId: affiliateLink.organizationId,
        orgDomain: organization.websiteUrl,
      })
      .from(affiliateLink)
      .innerJoin(
        organization,
        eq(affiliateLink.organizationId, organization.id)
      )
      .where(eq(affiliateLink.id, refCode))
      .limit(1)

    if (!affiliateLinkRecord || affiliateLinkRecord.orgDomain !== host) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid affiliate code for this domain" }),
        { status: 400 }
      )
    }

    const shouldTrack = await shouldTrackUser(affiliateLinkRecord.orgId)
    if (!shouldTrack) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          reason: "Tracking disabled for expired or unknown plan",
        }),
        { status: 200, headers: corsHeaders }
      )
    }
    await db.insert(affiliateClick).values({
      affiliateLinkId: refCode,
      userAgent: data.userAgent || null,
      referrer: data.referrer || null,
      browser: data.browser || null,
      os: data.os || null,
      deviceType: data.deviceType || null,
    })

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (err) {
    console.error("/api/track error:", err)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
