"use server"
import { mapDomainType } from "@/util/MapDomainType"
import { db } from "@/db/drizzle"
import { websiteDomain } from "@/db/schema"
import { CreateDomainType } from "@/lib/types/createDomainType"
import { addDomainToVercel } from "@/lib/server/manageVercelDomain"
import { and, eq, ne } from "drizzle-orm"

export async function createDomainsAction({
  orgId,
  domain,
  domainType,
}: CreateDomainType): Promise<void> {
  const normalized = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
  const mapped = mapDomainType(domainType)
  const finalDomain = mapped.finalDomain(normalized)
  if (mapped.type === "DEFAULT") {
    await db.insert(websiteDomain).values({
      orgId,
      domainName: finalDomain,
      type: mapped.type,
      dnsStatus: mapped.dnsStatus,
      isVerified: mapped.isVerified,
      isActive: true,
      isPrimary: false,
      isRedirect: false,
    })
    return
  }
  const existingCustomDomains = await db
    .select()
    .from(websiteDomain)
    .where(
      and(eq(websiteDomain.orgId, orgId), ne(websiteDomain.type, "DEFAULT"))
    )

  if (existingCustomDomains.length >= 1) {
    throw {
      ok: false,
      toast:
        "You can only connect one custom domain or subdomain per organization",
    }
  }
  await addDomainToVercel(finalDomain)
  await db.insert(websiteDomain).values({
    orgId,
    domainName: finalDomain,
    type: mapped.type,
    dnsStatus: mapped.dnsStatus,
    isVerified: mapped.isVerified,
    isActive: false,
    isPrimary: false,
    isRedirect: false,
  })
}
