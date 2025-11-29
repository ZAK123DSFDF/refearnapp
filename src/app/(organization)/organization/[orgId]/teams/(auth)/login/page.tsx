import React from "react"
import Login from "@/components/pages/Login"
import { redirectTeamIfAuthed } from "@/lib/server/authGuards"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { OrgIdProps } from "@/lib/types/orgId"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Login Page",
    description: "Teams Login Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/login`,
    indexable: false,
  })
}
const loginPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await redirectTeamIfAuthed(orgId)
  return (
    <>
      <Login affiliate={false} isTeam orgId={orgId} />
    </>
  )
}
export default loginPage
