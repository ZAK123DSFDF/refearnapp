import React from "react"
import Links from "@/components/pages/AffiliateDashboard/Links/Links"
import { OrgIdProps } from "@/lib/types/orgId"
import { MissingPaypalEmailCard } from "@/components/ui-custom/MissingPayoutEmailCard"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
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
    title: `${org.name} | Dashboard Links Page`,
    description: org.description ?? `Dashboard Links Page for ${org.name}`,
    url: `${orgBaseUrl}/dashboard/links`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}
const linksPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireAffiliateWithOrg(orgId)
  return (
    <div className="space-y-6">
      <MissingPaypalEmailCard affiliate orgId={orgId} />
      <Links orgId={orgId} affiliate />
    </div>
  )
}
export default linksPage
