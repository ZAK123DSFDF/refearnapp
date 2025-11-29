import React from "react"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { OrgIdProps } from "@/lib/types/orgId"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"

interface AnalyticsLayoutProps {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
  cards: React.ReactNode
  charts: React.ReactNode
  referrers: React.ReactNode
  topAffiliates: React.ReactNode
}
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Analytics Page",
    description: "Teams Analytics Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/dashboard/analytics`,
    indexable: false,
  })
}
export default async function AnalyticsLayout({
  children,
  params,
  cards,
  charts,
  referrers,
  topAffiliates,
}: AnalyticsLayoutProps) {
  await getValidatedOrgFromParams({ params })
  return (
    <div className="space-y-8">
      {children}
      {cards}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-full">{charts}</div>
        <div className="h-full">{referrers}</div>
      </div>
      {topAffiliates}
    </div>
  )
}
