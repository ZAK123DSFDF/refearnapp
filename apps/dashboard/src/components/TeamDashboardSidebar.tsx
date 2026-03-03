"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Link as LinkIcon,
  Users,
  Settings,
  CreditCard,
  Layers,
  User,
  Globe,
  MailQuestion,
  MousePointerClick,
  TicketPercent,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { TeamData } from "@/lib/types/organization/profileTypes"
import { useCloseSidebarOnNavigation } from "@/hooks/useCloseSidebarOnNavigation"
import { OrgHeader } from "@/components/ui-custom/OrgHeader"
import { SidebarHelp } from "@/components/ui-custom/SidebarHelp"
import { SystemUpdate } from "@/components/ui-custom/SystemUpdate"

// Menu items for the sidebar

type Props = {
  orgId?: string
  TeamData: TeamData | null
  orgName?: string
  updateInfo?: { isNewer: boolean; latestVersion: string; url: string } | null
}
const TeamDashboardSidebar = ({
  orgId,
  TeamData,
  orgName,
  updateInfo,
}: Props) => {
  const pathname = usePathname()
  const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
  useCloseSidebarOnNavigation()
  const items = [
    {
      title: "Dashboard",
      url: `/organization/${orgId}/teams/dashboard/analytics`,
      icon: BarChart3,
    },
    {
      title: "Affiliates",
      url: `/organization/${orgId}/teams/dashboard/affiliates`,
      icon: LinkIcon,
    },
    {
      title: "Payout",
      url: `/organization/${orgId}/teams/dashboard/payout`,
      icon: Users,
    },
    {
      title: "Customization",
      url: `/organization/${orgId}/teams/dashboard/customization`,
      icon: CreditCard,
    },
    {
      title: "Integration",
      url: `/organization/${orgId}/teams/dashboard/integration`,
      icon: Layers,
    },
    {
      title: "Referrals",
      url: `/organization/${orgId}/dashboard/referrals`,
      icon: MousePointerClick,
    },
    {
      title: "Coupons",
      url: `/organization/${orgId}/dashboard/coupons`,
      icon: TicketPercent,
    },
    {
      title: "Settings",
      url: `/organization/${orgId}/teams/dashboard/settings`,
      icon: Settings,
    },
    {
      title: "Manage Domains",
      url: `/organization/${orgId}/teams/dashboard/manageDomains`,
      icon: Globe,
    },
    ...(!isSelfHosted
      ? [
          {
            title: "Support Email",
            url: `/organization/${orgId}/dashboard/supportEmail`,
            icon: MailQuestion,
          },
        ]
      : []),
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center py-4">
        <OrgHeader affiliate={false} isPreview={false} noRedirect />
        <div className="text-sm font-medium text-muted-foreground truncate max-w-[150px] text-right">
          {orgName}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarHelp />
        <SystemUpdate variant="badge" updateInfo={updateInfo} />
        <Link href={`/organization/${orgId}/teams/dashboard/profile`}>
          <div className="flex items-center space-x-3 p-2 rounded-md bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{TeamData?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {TeamData?.email}
              </p>
            </div>
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}

export default TeamDashboardSidebar
