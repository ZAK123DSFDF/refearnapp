import React from "react"
import ResetPassword from "@/components/pages/Reset-password"
import InvalidToken from "@/components/pages/InvalidToken"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { validateResetToken } from "@/lib/server/auth/validateResetToken"
import { redirectIfAffiliateAuthed } from "@/lib/server/auth/authGuards"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/organization/getOrganization"
import { getOrgBaseUrl } from "@/lib/server/organization/getOrgBaseUrl"
import { buildMetadata } from "@/util/BuildMetadata"
import { OrgIdProps } from "@/lib/types/organization/orgId"

type Props = {
  searchParams: Promise<{ affiliateToken?: string }>
  params: Promise<{ orgId: string }>
}
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })
  const org = await getOrganization(orgId)
  const orgBaseUrl = await getOrgBaseUrl(org.id)
  return buildMetadata({
    title: `${org.name} | Reset Password Page`,
    description: org.description ?? `Reset Password Page for ${org.name}`,
    url: `${orgBaseUrl}/reset-password`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}
const ResetPasswordPage = async ({ searchParams, params }: Props) => {
  const { affiliateToken } = await searchParams
  const orgId = await getValidatedOrgFromParams({ params })
  await redirectIfAffiliateAuthed(orgId)
  if (!affiliateToken) {
    return (
      <InvalidToken
        affiliate
        message="The reset link is invalid or expired."
        orgId={orgId}
      />
    )
  }

  const sessionPayload = await validateResetToken({
    token: affiliateToken,
    tokenType: "affiliate",
  })

  if (!sessionPayload) {
    return (
      <InvalidToken
        affiliate
        message="The reset link is invalid or expired."
        orgId={orgId}
      />
    )
  }

  return (
    <ResetPassword orgId={orgId} affiliate userId={sessionPayload.data.id} />
  )
}

export default ResetPasswordPage
