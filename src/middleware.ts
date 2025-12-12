import { NextRequest, NextResponse } from "next/server"
import { websiteDomain } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host")
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://refearnapp.com"
  if (!host) return NextResponse.next()
  if (
    host.includes("localhost:3000") ||
    host.includes("127.0.0.1:3000") ||
    host === "refearnapp.com" ||
    host === "www.refearnapp.com" ||
    host.endsWith(".vercel.app")
  ) {
    return NextResponse.next()
  }
  const db = await getDB()
  const [foundDomain] = await db
    .select({
      id: websiteDomain.id,
      orgId: websiteDomain.orgId,
      domainName: websiteDomain.domainName,
      isActive: websiteDomain.isActive,
      isRedirect: websiteDomain.isRedirect,
    })
    .from(websiteDomain)
    .where(eq(websiteDomain.domainName, host))
    .limit(1)

  if (!foundDomain) {
    return NextResponse.rewrite(new URL("/404", req.url))
  }
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", `https://${host}`))
  }
  if (foundDomain.isRedirect) {
    const [newDomain] = await db
      .select({ domainName: websiteDomain.domainName })
      .from(websiteDomain)
      .where(
        and(
          eq(websiteDomain.orgId, foundDomain.orgId),
          eq(websiteDomain.isActive, true)
        )
      )
      .limit(1)

    if (newDomain) {
      return NextResponse.redirect(
        new URL(
          req.nextUrl.pathname + req.nextUrl.search,
          `https://${newDomain.domainName}`
        )
      )
    }
  }
  const rewriteUrl = new URL(
    `/affiliate/${foundDomain.orgId}${req.nextUrl.pathname}${req.nextUrl.search}`,
    req.url
  )

  const response = NextResponse.rewrite(rewriteUrl)
  response.headers.set("x-current-host", host)
  return response
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
