import { handleAction } from "@/lib/handleAction"
import { ActionResult } from "@/lib/types/response"
import { DomainRow } from "@/lib/types/domainRow"
import { getDomainsAction } from "@/lib/server/getDomainsAction"
import { getTeamAuthAction } from "@/lib/server/getTeamAuthAction"
export async function getTeamDomains(
  orgId: string,
  offset?: number,
  domain?: string
): Promise<
  ActionResult<{
    rows: DomainRow[]
    hasNext: boolean
  }>
> {
  return handleAction("getTeamDomains", async () => {
    await getTeamAuthAction(orgId)
    return getDomainsAction(orgId, offset, domain)
  })
}
