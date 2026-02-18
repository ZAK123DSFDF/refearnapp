import React from "react"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import AffiliatesTable from "@/components/pages/Dashboard/Affiliates/Affiliates"
import { requireOrganizationWithOrg } from "@/lib/server/auth/authGuards"

const topAffiliatesPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  return (
    <>
      <AffiliatesTable
        affiliate={false}
        orgId={orgId}
        cardTitle="Top Affiliates"
        mode="top"
        orderOptions={["sales", "visits", "conversionRate"]}
      />
    </>
  )
}
export default topAffiliatesPage
