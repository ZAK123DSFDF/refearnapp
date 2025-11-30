// app/dashboard/layout.tsx
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { OrgIdProps } from "@/lib/types/orgId"
import AffiliateDashboardSidebar from "@/components/AffiliateDashboardSidebar"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { getAffiliateData } from "@/app/affiliate/[orgId]/dashboard/profile/action"
import { CustomizationProvider } from "@/app/affiliate/[orgId]/dashboard/customizationProvider"
import { requireAffiliateWithOrg } from "@/lib/server/authGuards"
import React from "react"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/getOrganization"
import { getOrgBaseUrl } from "@/lib/server/getOrgBaseUrl"
import { buildMetadata } from "@/util/BuildMetadata"

interface AffiliateDashboardLayoutProps extends OrgIdProps {
  children: React.ReactNode
}
export default async function DashboardLayout({
  children,
  params,
}: AffiliateDashboardLayoutProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireAffiliateWithOrg(orgId)
  const affiliateResponse = await getAffiliateData(orgId)
  if (!affiliateResponse.ok) {
    console.log("No affiliate found or unauthorized")
    return null
  }

  const affiliate = affiliateResponse.data
  return (
    <CustomizationProvider affiliate orgId={orgId}>
      <SidebarProvider affiliate orgId={orgId}>
        <AffiliateDashboardSidebar
          affiliate
          orgId={orgId}
          AffiliateData={affiliate}
        />
        <SidebarInset
          affiliate
          className="relative flex w-full flex-1 flex-col bg-background overflow-auto"
        >
          <div className="md:hidden px-6 pt-4">
            <SidebarTrigger />
          </div>
          <div className="py-6 px-6 w-full max-w-7xl mx-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </CustomizationProvider>
  )
}
