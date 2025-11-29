import React from "react"
import ForgotPassword from "@/components/pages/Forgot-password"
import { redirectTeamIfAuthed } from "@/lib/server/authGuards"
import { OrgIdProps } from "@/lib/types/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Forgot Password Page",
    description: "Teams Forgot Password Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/forgot-password`,
    indexable: false,
  })
}
const forgetPasswordPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await redirectTeamIfAuthed(orgId)
  return (
    <>
      <ForgotPassword affiliate={false} isTeam orgId={orgId} />
    </>
  )
}
export default forgetPasswordPage
