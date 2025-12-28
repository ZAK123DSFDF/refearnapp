import { handleAction } from "@/lib/handleAction"
import { getOrgAuth } from "@/lib/server/GetOrgAuth"
import { ActionResult } from "@/lib/types/response"
import { DomainRow } from "@/lib/types/domainRow"
import { and, eq, ilike } from "drizzle-orm"
import { websiteDomain } from "@/db/schema"
import { db } from "@/db/drizzle"
export async function getDomains(
  orgId: string,
  offset?: number,
  domain?: string
): Promise<
  ActionResult<{
    rows: DomainRow[]
    hasNext: boolean
  }>
> {
  return handleAction("getDomains", async () => {
    await getOrgAuth(orgId)

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
  })
}
