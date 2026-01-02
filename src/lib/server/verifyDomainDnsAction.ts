"use server"

import { db } from "@/db/drizzle"
import { websiteDomain } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import {
  getVercelDomainConfig,
  verifyDomainOnVercel,
} from "@/lib/server/manageVercelDomain"

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

  const verifyData = (await verifyDomainOnVercel(domain.domainName)) as any
  // 2. Check DNS Configuration (The missing piece)
  const configData = (await getVercelDomainConfig(domain.domainName)) as any
  const isDnsValid = !configData.misconfigured
  const isFullyActive = verifyData.verified && isDnsValid
  await db
    .update(websiteDomain)
    .set({
      isVerified: isFullyActive,
      dnsStatus: isFullyActive ? "Verified" : "Pending",
      isActive: isFullyActive,
      updatedAt: new Date(),
    })
    .where(and(eq(websiteDomain.id, domainId), eq(websiteDomain.orgId, orgId)))

  if (!isFullyActive) {
    throw {
      ok: false,
      toast: "DNS records not yet detected. This can take up to 48 hours.",
    }
  }
}
