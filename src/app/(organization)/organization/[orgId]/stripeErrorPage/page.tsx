import React from "react"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireOrganizationWithOrg } from "@/lib/server/authGuards"
import { OrgIdProps } from "@/lib/types/orgId"
import StripeError from "@/components/pages/StripeError"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Stripe Error Page",
    description: "Stripe Error Page",
    url: `https://refearnapp.com/organization/${orgId}/stripeErrorPage`,
    indexable: false,
  })
}
const stripeErrorPage = async ({
  params,
  searchParams,
}: OrgIdProps & { searchParams: Promise<{ message?: string }> }) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  const { message } = await searchParams
  return (
    <>
      <StripeError message={message} />
    </>
  )
}
export default stripeErrorPage
