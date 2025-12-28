import React from "react"
import { OrgIdProps } from "@/lib/types/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireTeamWithOrg } from "@/lib/server/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
import { ManageDomainsTable } from "@/components/pages/Dashboard/manageDomains/manageDomainsTable"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Manage Domains Page",
    description: "Teams Manage Domains Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/dashboard/manageDomains`,
    indexable: false,
  })
}
const teamManageDomainsPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireTeamWithOrg(orgId)
  return (
    <>
      <ManageDomainsTable affiliate={false} orgId={orgId} isTeam />
    </>
  )
}
export default teamManageDomainsPage
