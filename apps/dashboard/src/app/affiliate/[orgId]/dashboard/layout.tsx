// app/dashboard/layout.tsx
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import AffiliateDashboardSidebar from "@/components/AffiliateDashboardSidebar"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { CustomizationProvider } from "@/app/affiliate/[orgId]/dashboard/customizationProvider"
import { requireAffiliateWithOrg } from "@/lib/server/auth/authGuards"
import React from "react"
import { getAffiliateData } from "@/lib/server/affiliate/getAffiliateData"
import { getUnseenCouponsCount } from "@/lib/server/affiliate/getUnseenCouponsCount"
import { AffiliateSupportButton } from "@/components/ui-custom/AffiliateSupportButton"
import { getOrganization } from "@/lib/server/organization/getOrganization"
import { getLicense } from "@/lib/server/organization/getLicense"

interface AffiliateDashboardLayoutProps extends OrgIdProps {
  children: React.ReactNode
}
export default async function DashboardLayout({
  children,
  params,
}: AffiliateDashboardLayoutProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  const org = await getOrganization(orgId)
  await requireAffiliateWithOrg(orgId)
  const affiliateResponse = await getAffiliateData(orgId)
  if (!affiliateResponse.ok) {
    console.log("No affiliate found or unauthorized")
    return null
  }

  const affiliate = affiliateResponse.data
  const unseenCouponsCount = await getUnseenCouponsCount(orgId, affiliate.id)
  const licenseResult = await getLicense(orgId)
  const licenseData = licenseResult?.ok ? licenseResult.data : null
  return (
    <CustomizationProvider affiliate orgId={orgId}>
      <SidebarProvider affiliate orgId={orgId}>
        <AffiliateDashboardSidebar
          affiliate
          orgId={orgId}
          AffiliateData={affiliate}
          unseenCouponsCount={unseenCouponsCount}
        />
        <SidebarInset
          affiliate
          className="relative flex w-full flex-1 flex-col bg-background overflow-auto"
        >
          <div className="md:hidden px-6 pt-4">
            <SidebarTrigger affiliate />
          </div>
          <div className="py-6 px-6 w-full max-w-7xl mx-auto">{children}</div>
          <AffiliateSupportButton
            supportEmail={org.supportEmail}
            orgName={org.name}
            affiliateEmail={affiliate.email}
          />
        </SidebarInset>
      </SidebarProvider>
    </CustomizationProvider>
  )
}
