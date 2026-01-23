import React from "react"
import { OrgIdProps } from "@/lib/types/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireOrganizationWithOrg } from "@/lib/server/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
import SupportEmail from "@/components/pages/Support-email"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })
  return buildMetadata({
    title: "RefearnApp | Support Email Page",
    description: "Support Email Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/supportEmail`,
    indexable: false,
  })
}
const supportEmailPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  return (
    <>
      <SupportEmail orgId={orgId} affiliate={false} />
    </>
  )
}
export default supportEmailPage
