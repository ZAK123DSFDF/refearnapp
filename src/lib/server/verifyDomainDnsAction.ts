"use server"

import { db } from "@/db/drizzle"
import { websiteDomain } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { verifyDomainOnVercel } from "@/lib/server/manageVercelDomain"

export async function verifyDomainDnsAction({
  orgId,
  domainId,
}: {
  orgId: string
  domainId: string
}) {
  const [domain] = await db
    .select({
      domainName: websiteDomain.domainName,
    })
    .from(websiteDomain)
    .where(and(eq(websiteDomain.id, domainId), eq(websiteDomain.orgId, orgId)))
    .limit(1)

  if (!domain) {
    throw { ok: false, toast: "Domain not found" }
  }

  const result = await verifyDomainOnVercel(domain.domainName)

  await db
    .update(websiteDomain)
    .set({
      isVerified: result.verified ?? false,
      dnsStatus: result.verified ? "Verified" : "Pending",
      isActive: true,
      isRedirect: false,
    })
    .where(and(eq(websiteDomain.id, domainId), eq(websiteDomain.orgId, orgId)))
}
