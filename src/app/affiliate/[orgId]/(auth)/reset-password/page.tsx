import React from "react"
import ResetPassword from "@/components/pages/Reset-password"
import InvalidToken from "@/components/pages/InvalidToken"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { validateResetToken } from "@/lib/server/validateResetToken"
import { redirectIfAffiliateAuthed } from "@/lib/server/authGuards"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/getOrganization"
import { getOrgBaseUrl } from "@/lib/server/getOrgBaseUrl"
import { buildMetadata } from "@/util/BuildMetadata"
import { OrgIdProps } from "@/lib/types/orgId"

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

  return <ResetPassword orgId={orgId} affiliate userId={sessionPayload.id} />
}

export default ResetPasswordPage
