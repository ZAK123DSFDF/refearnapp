import React from "react"
import Profile from "@/components/pages/Dashboard/Profile/Profile"
import { OrgIdProps } from "@/lib/types/orgId"
import { getAffiliateData } from "@/app/affiliate/[orgId]/dashboard/profile/action"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { ErrorCard } from "@/components/ui-custom/ErrorCard"
import { requireAffiliateWithOrg } from "@/lib/server/authGuards"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/getOrganization"
import { getOrgBaseUrl } from "@/lib/server/getOrgBaseUrl"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })
  const org = await getOrganization(orgId)
  const orgBaseUrl = await getOrgBaseUrl(org.id)
  return buildMetadata({
    title: `${org.name} | Dashboard Profile Page`,
    description: org.description ?? `Dashboard Profile Page for ${org.name}`,
    url: `${orgBaseUrl}/dashboard/profile`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}
const profilePage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireAffiliateWithOrg(orgId)
  const affiliateResponse = await getAffiliateData(orgId)
  if (!affiliateResponse.ok) {
    return (
      <ErrorCard message={affiliateResponse.error || "Something went wrong"} />
    )
  }
  return (
    <>
      <Profile orgId={orgId} affiliate AffiliateData={affiliateResponse.data} />
    </>
  )
}
export default profilePage
