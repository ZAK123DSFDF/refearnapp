import React from "react"
import AffiliatesTable from "@/components/pages/Dashboard/Affiliates/Affiliates"
import { OrgIdProps } from "@/lib/types/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireOrganizationWithOrg } from "@/lib/server/authGuards"
import { buildMetadata } from "@/util/BuildMetadata"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Affiliates Page",
    description: "Affiliates Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/affiliates`,
    indexable: false,
  })
}
const affiliatePage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  return (
    <>
      <AffiliatesTable
        affiliate={false}
        orgId={orgId}
        cardTitle="All Affiliates"
        showHeader
      />
    </>
  )
}
export default affiliatePage
