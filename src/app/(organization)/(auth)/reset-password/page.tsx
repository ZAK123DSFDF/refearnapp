import React from "react"
import ResetPassword from "@/components/pages/Reset-password"
import InvalidToken from "@/components/pages/InvalidToken"
import { validateResetToken } from "@/lib/server/auth/validateResetToken"
import { redirectIfAuthed } from "@/lib/server/auth/authGuards"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"

type Props = {
  searchParams: Promise<{ organizationToken?: string }>
}
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Reset Password Page",
  description: "Reset Password Page",
  url: "https://refearnapp.com/reset-password",
  indexable: false,
})
const ResetPasswordPage = async ({ searchParams }: Props) => {
  await redirectIfAuthed()
  const { organizationToken } = await searchParams

  if (!organizationToken) {
    return (
      <InvalidToken
        affiliate={false}
        message="The reset link is invalid or expired."
      />
    )
  }

  const sessionPayload = await validateResetToken({
    token: organizationToken,
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
    />
  )
}

export default ResetPasswordPage
