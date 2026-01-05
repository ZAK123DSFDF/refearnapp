// app/dashboard/analytics/layout.tsx
import { MissingPaypalEmailCard } from "@/components/ui-custom/MissingPayoutEmailCard"
import React from "react"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { CustomizationProvider } from "@/app/affiliate/[orgId]/dashboard/customizationProvider"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/getOrganization"
import { getOrgBaseUrl } from "@/lib/server/getOrgBaseUrl"
import { buildMetadata } from "@/util/BuildMetadata"
import { OrgIdProps } from "@/lib/types/orgId"

interface AnalyticsLayoutProps {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
  cards: React.ReactNode
  charts: React.ReactNode
  referrers: React.ReactNode
}
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })
  const org = await getOrganization(orgId)
  const orgBaseUrl = await getOrgBaseUrl(org.id)
  return buildMetadata({
    title: `${org.name} | Dashboard Analytics Page`,
    description: org.description ?? `Dashboard Analytics Page for ${org.name}`,
    url: `${orgBaseUrl}/dashboard/analytics`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}
export default async function AnalyticsLayout({
  children,
  params,
  cards,
  charts,
  referrers,
}: AnalyticsLayoutProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  return (
    <div className="space-y-8">
      {children}
      <MissingPaypalEmailCard affiliate orgId={orgId} />
      {cards}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-full">{charts}</div>
        <div className="h-full">{referrers}</div>
      </div>
    </div>
  )
}
