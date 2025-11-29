import React from "react"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { AuthCustomizationProvider } from "@/app/affiliate/[orgId]/(auth)/authCustomizationProvider"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/getOrganization"
import { buildMetadata } from "@/util/BuildMetadata"
interface authLayoutProps {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}
export async function generateMetadata({
  params,
}: {
  params: { orgId: string }
}): Promise<Metadata> {
  const org = await getOrganization(params.orgId)

  // fallback image if org has no custom OG image
  const image = org.openGraphUrl ?? "/opengraph.png"

  return buildMetadata({
    title: `${org.name} | Affiliate Authentication Page`,
    description: org.description ?? `Affiliate dashboard for ${org.name}`,
    image,
    url: `https://refearnapp.com/affiliate/${org.id}`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    indexable: false,
  })
}
export default async function AuthLayout({
  children,
  params,
}: authLayoutProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  return (
    <AuthCustomizationProvider affiliate orgId={orgId}>
      {children}
    </AuthCustomizationProvider>
  )
}
