import React from "react"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireOrganizationWithOrg } from "@/lib/server/auth/authGuards"
import { buildMetadata } from "@/util/BuildMetadata"
import { Metadata } from "next"
import PromotionCodesTable from "@/components/pages/Dashboard/Coupons/PromotionCodesTable"

export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Coupons Page",
    description: "Affiliates Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/coupons`,
    indexable: false,
  })
}
const couponsPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  return (
    <>
      <PromotionCodesTable orgId={orgId} />
    </>
  )
}
export default couponsPage
