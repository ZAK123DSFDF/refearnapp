import React from "react"
import Settings from "@/components/pages/Dashboard/Settings/Settings"
import { OrgIdProps } from "@/lib/types/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { ErrorCard } from "@/components/ui-custom/ErrorCard"
import { requireTeamWithOrg } from "@/lib/server/authGuards"
import { orgTeamInfo } from "@/app/(organization)/organization/[orgId]/teams/dashboard/settings/action"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Settings Page",
    description: "Teams Settings Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/dashboard/settings`,
    indexable: false,
  })
}
const SettingsPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireTeamWithOrg(orgId)
  const orgResponse = await orgTeamInfo(orgId)
  if (!orgResponse.ok) {
    return <ErrorCard message={orgResponse.error || "Something went wrong"} />
  }

  return <Settings orgData={orgResponse.data} isTeam />
}

export default SettingsPage
