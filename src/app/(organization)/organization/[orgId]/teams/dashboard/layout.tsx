// app/dashboard/layout.tsx
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireTeamWithOrg } from "@/lib/server/auth/authGuards"
import React from "react"
import TeamDashboardSidebar from "@/components/TeamDashboardSidebar"
import { ErrorCard } from "@/components/ui-custom/ErrorCard"
import { getTeamData } from "@/lib/server/team/getTeamData"
import { getTeamOrgSettings } from "@/lib/server/team/getTeamOrgSettings"
interface OrganizationDashboardLayoutProps extends OrgIdProps {
  children: React.ReactNode
}
export default async function DashboardLayout({
  children,
  params,
}: OrganizationDashboardLayoutProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireTeamWithOrg(orgId)
  const teamResponse = await getTeamData(orgId)
  const team = teamResponse.ok ? teamResponse.data : null
  const orgResponse = await getTeamOrgSettings(orgId)
  if (!orgResponse.ok) {
    return <ErrorCard message={orgResponse.error || "Something went wrong"} />
  }
  return (
    <SidebarProvider affiliate={false} orgId={orgId}>
      <TeamDashboardSidebar
        orgId={orgId}
        TeamData={team}
        orgName={orgResponse.data.name}
      />
      <SidebarInset className="relative flex w-full flex-1 flex-col bg-background overflow-auto">
        <div className="md:hidden px-6 pt-4">
          <SidebarTrigger />
        </div>
        <div className="py-6 px-6 w-full max-w-7xl mx-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
