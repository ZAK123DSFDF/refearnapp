import React from "react"
import Signup from "@/components/pages/Signup"
import { OrgIdProps } from "@/lib/types/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import InvalidToken from "@/components/pages/InvalidToken"
import { getTeamValidation } from "@/lib/server/getTeamValidation"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
type TeamSignupProps = OrgIdProps & {
  searchParams: Promise<{ teamToken?: string }>
}
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Signup Page",
    description: "Teams Signup Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/signup`,
    indexable: false,
  })
}
const TeamSignupPage = async ({ params, searchParams }: TeamSignupProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  const { teamToken } = await searchParams
  if (!teamToken) {
    return (
      <InvalidToken
        affiliate={false}
        message="Missing team invitation token."
      />
    )
  }
  const invite = await getTeamValidation(teamToken)

  if (!invite) {
    return (
      <InvalidToken
        affiliate={false}
        message="Invalid or expired team invitation token."
      />
    )
  }

  return (
    <>
      <Signup affiliate={false} orgId={orgId} isTeam />
    </>
  )
}

export default TeamSignupPage
