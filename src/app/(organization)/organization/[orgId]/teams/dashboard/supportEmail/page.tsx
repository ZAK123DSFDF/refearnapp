import React from "react"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireTeamWithOrg } from "@/lib/server/auth/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
import SupportEmail from "@/components/pages/Support-email"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Support Email Page",
    description: "Teams Support Email Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/dashboard/supportEmail`,
    indexable: false,
  })
}
const supportEmailPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireTeamWithOrg(orgId)
  return (
    <>
      <SupportEmail isTeam orgId={orgId} affiliate={false} />
    </>
  )
}
export default supportEmailPage
