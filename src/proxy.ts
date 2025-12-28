import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/drizzle"
import { websiteDomain } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export async function proxy(req: NextRequest) {
  const host = req.headers.get("host")
  if (!host) return NextResponse.next()

  // 🚫 Skip platform / dev / vercel
  if (
    host === "refearnapp.com" ||
    host === "www.refearnapp.com" ||
    host.endsWith(".vercel.app") ||
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1")
  ) {
    return NextResponse.next()
  }

  // 🔍 Find domain
  const [domain] = await db
    .select({
      orgId: websiteDomain.orgId,
      isActive: websiteDomain.isActive,
      isRedirect: websiteDomain.isRedirect,
      isPrimary: websiteDomain.isPrimary,
    })
    .from(websiteDomain)
    .where(eq(websiteDomain.domainName, host))
    .limit(1)

  // ❌ Unknown domain
  if (!domain) {
    return NextResponse.rewrite(new URL("/404", req.url))
  }

  /**
   * 🔁 Redirect case
   * inactive + redirect = true
   */
  if (!domain.isActive && domain.isRedirect) {
    const [primary] = await db
      .select({ domainName: websiteDomain.domainName })
      .from(websiteDomain)
      .where(
        and(
          eq(websiteDomain.orgId, domain.orgId),
          eq(websiteDomain.isPrimary, true)
        )
      )
      .limit(1)

    if (!primary) {
      // ⚠️ Data corruption fallback
      return NextResponse.rewrite(new URL("/404", req.url))
    }

    return NextResponse.redirect(
      new URL(
        req.nextUrl.pathname + req.nextUrl.search,
        `https://${primary.domainName}`
      ),
      308
    )
  }

  /**
   * ❌ Inactive and no redirect
   */
  if (!domain.isActive) {
    return NextResponse.rewrite(new URL("/404", req.url))
  }

  /**
   * 🟢 Active domain → rewrite
   */
  const rewriteUrl = new URL(
    `/affiliate/${domain.orgId}${req.nextUrl.pathname}${req.nextUrl.search}`,
    req.url
  )

  const response = NextResponse.rewrite(rewriteUrl)
  response.headers.set("x-current-host", host)

  return response
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
