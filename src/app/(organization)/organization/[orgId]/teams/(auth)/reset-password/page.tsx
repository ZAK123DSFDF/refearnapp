import React from "react"
import ResetPassword from "@/components/pages/Reset-password"
import InvalidToken from "@/components/pages/InvalidToken"
import { validateResetToken } from "@/lib/server/auth/validateResetToken"
import {
  redirectIfAuthed,
  redirectTeamIfAuthed,
} from "@/lib/server/auth/authGuards"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"

type Props = {
  searchParams: Promise<{ teamToken?: string }>
  params: Promise<{ orgId: string }>
}
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Reset Password Page",
    description: "Teams Reset Password Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/reset-password`,
    indexable: false,
  })
}
const ResetPasswordPage = async ({ searchParams, params }: Props) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await redirectTeamIfAuthed(orgId)
  const { teamToken } = await searchParams

  if (!teamToken) {
    return (
      <InvalidToken
        affiliate={false}
        message="The reset link is invalid or expired."
      />
    )
  }

  const sessionPayload = await validateResetToken({
    token: teamToken,
    tokenType: "organization",
  })
  if (!sessionPayload) {
    return (
      <InvalidToken
        affiliate={false}
        message="The reset link is invalid or expired."
      />
    )
  }

  return (
    <ResetPassword
      affiliate={false}
      userId={sessionPayload.data.id}
      orgId={sessionPayload.data.orgId}
      isTeam
    />
  )
}

export default ResetPasswordPage
