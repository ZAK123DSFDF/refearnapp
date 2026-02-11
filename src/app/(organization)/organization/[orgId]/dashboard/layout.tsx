// app/dashboard/layout.tsx
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import OrganizationDashboardSidebar from "@/components/OrganizationDashboardSidebar"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { getUserPlan } from "@/lib/server/organization/getUserPlan"
import { requireOrganizationWithOrg } from "@/lib/server/auth/authGuards"
import { getUserOrgs } from "@/lib/server/organization/getUserOrgs"
import React from "react"
import { SubscriptionStatusBanner } from "@/components/ui-custom/SubscriptionStatusBanner"
import { getUserData } from "@/lib/server/organization/getUserProfile"
interface OrganizationDashboardLayoutProps extends OrgIdProps {
  children: React.ReactNode
}
export default async function DashboardLayout({
  children,
  params,
}: OrganizationDashboardLayoutProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  const decoded = await requireOrganizationWithOrg(orgId)
  const plan = await getUserPlan()
  const orgs = await getUserOrgs(decoded.id)
  const userResponse = await getUserData()
  const user = userResponse.ok ? userResponse.data : null
  return (
    <SidebarProvider affiliate={false} orgId={orgId}>
      <OrganizationDashboardSidebar
        orgId={orgId}
        plan={plan}
        orgs={orgs}
        UserData={user}
      />
      <SidebarInset className="relative flex w-full flex-1 flex-col bg-background overflow-auto">
        <div className="md:hidden px-6 pt-4">
          <SidebarTrigger />
        </div>
        <div className="py-6 px-6 w-full max-w-7xl mx-auto">
          <SubscriptionStatusBanner plan={plan} orgId={orgId} />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
