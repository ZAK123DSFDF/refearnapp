import React from "react"
import AffiliatesTable from "@/components/pages/Dashboard/Affiliates/Affiliates"
import { OrgIdProps } from "@/lib/types/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireTeamWithOrg } from "@/lib/server/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Affiliates Page",
    description: "Teams Affiliates Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/dashboard/affiliates`,
    indexable: false,
  })
}
const affiliatePage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireTeamWithOrg(orgId)
  return (
    <>
      <AffiliatesTable
        affiliate={false}
        orgId={orgId}
        cardTitle="All Affiliates"
        showHeader
        isTeam
      />
    </>
  )
}
export default affiliatePage
