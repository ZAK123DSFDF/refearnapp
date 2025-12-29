"use server"
import { and, eq, ilike } from "drizzle-orm"
import { websiteDomain } from "@/db/schema"
import { db } from "@/db/drizzle"
import { ActionResult } from "@/lib/types/response"
import { DomainRow } from "@/lib/types/domainRow"

export async function getDomainsAction(
  orgId: string,
  offset?: number,
  domain?: string
): Promise<
  ActionResult<{
    rows: DomainRow[]
    hasNext: boolean
  }>
> {
  const PAGE_SIZE = 10
  const whereClauses = [eq(websiteDomain.orgId, orgId)]

  if (domain) {
    const cleanDomain = domain.replace(/^https?:\/\//, "")
    whereClauses.push(ilike(websiteDomain.domainName, `%${cleanDomain}%`))
  }

  const rows = await db
    .select({
      id: websiteDomain.id,
      domainName: websiteDomain.domainName,
      isActive: websiteDomain.isActive,
      isRedirect: websiteDomain.isRedirect,
      dnsStatus: websiteDomain.dnsStatus,
      isVerified: websiteDomain.isVerified,
      isPrimary: websiteDomain.isPrimary,
    })
    .from(websiteDomain)
    .where(and(...whereClauses))
    .limit(PAGE_SIZE + 1)
    .offset(((offset ?? 1) - 1) * PAGE_SIZE)
    .orderBy(websiteDomain.createdAt)

  return {
    ok: true,
    data: {
      rows: rows.slice(0, PAGE_SIZE),
      hasNext: rows.length > PAGE_SIZE,
    },
  }
}
