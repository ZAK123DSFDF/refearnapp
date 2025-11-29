import React from "react"
import Teams from "@/components/pages/Dashboard/Teams/Teams"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireOrganizationWithOrg } from "@/lib/server/authGuards"
import { OrgIdProps } from "@/lib/types/orgId"
import { getUserPlan } from "@/lib/server/getUserPlan"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams",
    description: "Teams Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/teams`,
    indexable: false,
  })
}
const TeamsPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  const plan = await getUserPlan()
  return (
    <>
      <Teams affiliate={false} orgId={orgId} plan={plan} />
    </>
  )
}
export default TeamsPage
