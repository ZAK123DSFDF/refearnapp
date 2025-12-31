"use server"
import { handleAction } from "@/lib/handleAction"
import { getOrgAuth } from "@/lib/server/GetOrgAuth"
import { ActionResult, MutationData } from "@/lib/types/response"
import { DomainRow } from "@/lib/types/domainRow"
import { getDomainsAction } from "@/lib/server/getDomainsAction"
import { CreateDomainType } from "@/lib/types/createDomainType"
import { createDomainsAction } from "@/lib/server/createDomainsAction"
import { toggleDomainActiveAction } from "@/lib/server/toggleDomainActiveAction"
import { makeDomainPrimaryAction } from "@/lib/server/makeDomainPrimaryAction"
import { toggleDomainRedirectAction } from "@/lib/server/toggleDomainRedirectAction"
import { deleteDomainAction } from "@/lib/server/deleteDomainAction"
import { verifyDomainDnsAction } from "@/lib/server/verifyDomainDnsAction"
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
    return getDomainsAction(orgId, offset, domain)
  })
}
export async function createDomains({
  orgId,
  domain,
  domainType,
}: CreateDomainType): Promise<MutationData> {
  return handleAction("createDomains", async () => {
    await getOrgAuth(orgId)
    await createDomainsAction({
      orgId,
      domain,
      domainType,
    })
    return { ok: true, toast: "Domain added successfully" }
  })
}
export async function toggleDomainActive({
  orgId,
  domainId,
  nextActive,
}: {
  orgId: string
  domainId: string
  nextActive: boolean
}): Promise<MutationData> {
  return handleAction("Toggle domain active", async () => {
    await getOrgAuth(orgId)
    await toggleDomainActiveAction({
      orgId,
      domainId,
      nextActive,
    })
    return { ok: true, toast: "Domain status updated" }
  })
}
export async function makeDomainPrimary({
  orgId,
  domainId,
}: {
  orgId: string
  domainId: string
}): Promise<MutationData> {
  return handleAction("Make domain primary", async () => {
    await getOrgAuth(orgId)
    await makeDomainPrimaryAction({ orgId, domainId })
    return { ok: true, toast: "Primary domain updated" }
  })
}
export async function toggleDomainRedirect({
  orgId,
  domainId,
  nextRedirect,
}: {
  orgId: string
  domainId: string
  nextRedirect: boolean
}): Promise<MutationData> {
  return handleAction("Toggle redirect", async () => {
    await getOrgAuth(orgId)
    await toggleDomainRedirectAction({
      orgId,
      domainId,
      nextRedirect,
    })
    return { ok: true, toast: "Redirect updated" }
  })
}
export async function deleteDomain({
  orgId,
  domainId,
}: {
  orgId: string
  domainId: string
}): Promise<MutationData> {
  return handleAction("Delete domain", async () => {
    await getOrgAuth(orgId)
    await deleteDomainAction({ orgId, domainId })
    return { ok: true, toast: "Domain deleted" }
  })
}
// ✅ Verify A record (for main domains)
export async function verifyDomain({
  orgId,
  domainId,
}: {
  orgId: string
  domainId: string
}): Promise<MutationData> {
  return handleAction("verifyDomain", async () => {
    await getOrgAuth(orgId)
    await verifyDomainDnsAction({ orgId, domainId })
    return {
      ok: true,
      toast: "✅ A record is correctly set.",
    }
  })
}
