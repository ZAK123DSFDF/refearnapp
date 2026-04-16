"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Link as LinkIcon,
  Users,
  User,
  Ticket,
  MousePointerClick,
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
import { cn } from "@/lib/utils"
import { AffiliateData } from "@/lib/types/organization/profileTypes"
import { useAtomValue } from "jotai"
import { sidebarCustomizationAtom } from "@/store/DashboardCustomizationAtom"
import { useAffiliatePath } from "@/hooks/useUrl"
import { OrgHeader } from "@/components/ui-custom/OrgHeader"
import { SidebarCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/SidebarCustomizationOptions"
import { useCloseSidebarOnNavigation } from "@/hooks/useCloseSidebarOnNavigation"
import { showNotificationAtom } from "@/store/ShowNotificationAtom"
import { UserLicense } from "@/lib/server/organization/getLicense"
import { useAccess } from "@/hooks/useAccess"

type Props = {
  orgId: string
  isPreview?: boolean
  onSelectPage?: (page: string) => void
  currentPage?: string
  affiliate: boolean
  AffiliateData?: AffiliateData | null
  unseenCouponsCount?: number
  license: UserLicense | null
}

const AffiliateDashboardSidebar = ({
  orgId,
  isPreview = false,
  onSelectPage,
  currentPage,
  affiliate,
  AffiliateData,
  unseenCouponsCount = 0,
  license,
}: Props) => {
  const pathname = usePathname()
  useCloseSidebarOnNavigation()
  const { getPath } = useAffiliatePath(orgId)
  const { canAccessUltimate } = useAccess(license)
  const showNotification = useAtomValue(showNotificationAtom)
  const displayBadgeCount = isPreview
    ? showNotification
      ? 3
      : 0
    : unseenCouponsCount
  const items = [
    {
      title: "Dashboard",
      url: getPath("dashboard/analytics"),
      icon: BarChart3,
    },
    { title: "Links", url: getPath("dashboard/links"), icon: LinkIcon },
    {
      title: "Referrals",
      url: getPath("dashboard/referrals"),
      icon: MousePointerClick,
    },
    ...(canAccessUltimate
      ? [
          {
            title: "Coupons",
            url: getPath("dashboard/coupons"),
            icon: Ticket,
            badge: displayBadgeCount > 0 ? displayBadgeCount : null,
          },
        ]
      : []),
    { title: "Payment", url: getPath("dashboard/payment"), icon: Users },
  ]
  const itemsPreview = [
    { title: "Dashboard", key: "dashboard", icon: BarChart3 },
    { title: "Links", key: "links", icon: LinkIcon },
    { title: "Referrals", key: "referrals", icon: MousePointerClick },
    ...(canAccessUltimate
      ? [
          {
            title: "Coupons",
            key: "coupons",
            icon: Ticket,
            badge: displayBadgeCount > 0 ? displayBadgeCount : null,
          },
        ]
      : []),
    { title: "Payment", key: "payment", icon: Users },
  ]
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const {
    sideBarHoverNavigationTextColor,
    sideBarHoverNavigationBackgroundColor,
    sideBarActiveNavigationBackgroundColor,
    sideBarProfileTextSecondaryColor,
    sideBarInActiveNavigationTextColor,
    sideBarNavigationFocusRingColor,
    sideBarProfileTextPrimaryColor,
    sideBarBackgroundColor,
    sideBarProfileBackgroundColor,
    sideBarActiveNavigationTextColor,
  } = useAtomValue(sidebarCustomizationAtom)
  const baseSidebarClass = isPreview ? "relative h-full" : "" // you can add full-screen layout styles here
  const setProfile = () => {
    onSelectPage && onSelectPage("profile")
  }
  return (
    <Sidebar className={baseSidebarClass}>
      <SidebarHeader
        style={{
          backgroundColor:
            (affiliate && sideBarBackgroundColor) ||
            "hsl(var(--sidebar-background))",
        }}
      >
        <div className="flex items-center justify-center gap-3 w-full">
          <OrgHeader
            orgId={orgId}
            affiliate={affiliate}
            isPreview={isPreview}
            sidebar
          />
          {isPreview && <SidebarCustomizationOptions triggerSize="w-6 h-6" />}
        </div>
      </SidebarHeader>

      <SidebarContent
        style={{
          backgroundColor:
            (affiliate && sideBarBackgroundColor) ||
            "hsl(var(--sidebar-background))",
        }}
      >
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {(isPreview ? itemsPreview : items).map((item: any) => {
                const isActive = currentPage === item.key
                const isHovered = hoveredKey === item.key

                const backgroundColor = isActive
                  ? (affiliate && sideBarActiveNavigationBackgroundColor) ||
                    "hsl(var(--sidebar-accent))"
                  : isHovered
                    ? (affiliate && sideBarHoverNavigationBackgroundColor) ||
                      undefined
                    : undefined

                const textColor = isActive
                  ? (affiliate && sideBarActiveNavigationTextColor) || undefined
                  : isHovered
                    ? (affiliate && sideBarHoverNavigationTextColor) ||
                      undefined
                    : (affiliate && sideBarInActiveNavigationTextColor) ||
                      undefined

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={!isPreview && pathname === item.url}
                      tooltip={item.title}
                    >
                      {isPreview ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPage && onSelectPage(item.key)
                          }}
                          onMouseEnter={() => setHoveredKey(item.key)}
                          onMouseLeave={() => setHoveredKey(null)}
                          className={cn(
                            "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors",
                            "focus:outline-none focus-visible:outline-none",
                            "focus-visible:ring-2 focus-visible:ring-red-500"
                          )}
                          style={{
                            backgroundColor: backgroundColor || undefined,
                            color: textColor || undefined,
                            ["--tw-ring-color" as any]:
                              (affiliate && sideBarNavigationFocusRingColor) ||
                              "hsl(var(--sidebar-ring))",
                          }}
                        >
                          <item.icon
                            className={cn("w-5 h-5", isActive && "font-medium")}
                            style={{ color: textColor || undefined }}
                          />
                          <span className={cn(isActive && "font-medium")}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ) : (
                        <Link href={item.url}>
                          <item.icon className="w-5 h-5" />
                          <span className={isPreview ? "text-sm" : ""}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className="p-4"
        style={{
          backgroundColor:
            (affiliate && sideBarBackgroundColor) ||
            "hsl(var(--sidebar-background))",
        }}
      >
        {isPreview ? (
          <div
            className="flex items-center space-x-3 p-2 rounded-md bg-primary/10 cursor-pointer"
            onClick={setProfile}
            style={{
              backgroundColor:
                (affiliate && sideBarProfileBackgroundColor) || undefined,
            }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{
                  color:
                    (affiliate && sideBarProfileTextPrimaryColor) || undefined,
                }}
              >
                John Doe
              </p>
              <p
                className="text-xs text-muted-foreground truncate"
                style={{
                  color:
                    (affiliate && sideBarProfileTextSecondaryColor) ||
                    undefined,
                }}
              >
                john.doe@example.com
              </p>
            </div>
            <User
              className="w-4 h-4 text-muted-foreground"
              style={{
                color:
                  (affiliate && sideBarProfileTextSecondaryColor) || undefined,
              }}
            />
          </div>
        ) : (
          <Link href={getPath("dashboard/profile")}>
            <div className="flex items-center space-x-3 p-2 rounded-md bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {AffiliateData?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {AffiliateData?.email}
                </p>
              </div>
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

export default AffiliateDashboardSidebar
