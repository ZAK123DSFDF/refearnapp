import React from "react"
import StripeSuccess from "@/components/pages/StripeSuccess"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireOrganizationWithOrg } from "@/lib/server/authGuards"
import { OrgIdProps } from "@/lib/types/orgId"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Stripe Success Page Page",
    description: "Stripe Success Page",
    url: `https://refearnapp.com/organization/${orgId}/stripeSuccessPage`,
    indexable: false,
  })
}
const stripeSuccessPage = async ({
  params,
  searchParams,
}: OrgIdProps & { searchParams: Promise<{ account?: string }> }) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  const { account } = await searchParams
  return (
    <>
      <StripeSuccess account={account} />
    </>
  )
}
export default stripeSuccessPage
