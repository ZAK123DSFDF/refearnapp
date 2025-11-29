import React from "react"
import { OrgIdProps } from "@/lib/types/orgId"
import PayoutTable from "@/components/pages/Dashboard/Payouts/PayoutTable"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireTeamWithOrg } from "@/lib/server/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Payout Page",
    description: "Teams Payout Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/dashboard/payout`,
    indexable: false,
  })
}
const payoutPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireTeamWithOrg(orgId)
  return (
    <>
      <PayoutTable affiliate={false} orgId={orgId} isTeam />
    </>
  )
}
export default payoutPage
