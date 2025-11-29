import React from "react"
import { OrgIdProps } from "@/lib/types/orgId"
import PayoutTable from "@/components/pages/Dashboard/Payouts/PayoutTable"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireOrganizationWithOrg } from "@/lib/server/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Payout Page",
    description: "Payout Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/payout`,
    indexable: false,
  })
}
const payoutPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  return (
    <>
      <PayoutTable affiliate={false} orgId={orgId} />
    </>
  )
}
export default payoutPage
