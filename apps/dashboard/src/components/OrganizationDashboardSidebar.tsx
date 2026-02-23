"use client"

import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
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
  TicketPercent,
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
import CreateCompany from "@/components/pages/Create-Company"
import { DropdownInput } from "@/components/ui-custom/DropDownInput"
import { useSwitchOrg } from "@/hooks/useSwitchOrg"
import { OrganizationData } from "@/lib/types/organization/profileTypes"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { PlanInfo } from "@/lib/types/organization/planInfo"
import { Button } from "@/components/ui/button"
import { usePaddlePortal } from "@/hooks/usePaddlePortal"
import { handlePlanRedirect } from "@/util/HandlePlanRedirect"
import { OrgHeader } from "@/components/ui-custom/OrgHeader"
import { useCloseSidebarOnNavigation } from "@/hooks/useCloseSidebarOnNavigation"

// Menu items for the sidebar

type Props = {
  orgId?: string
  plan: PlanInfo
  orgs: { id: string; name: string }[]
  UserData: OrganizationData | null
}
const OrganizationDashboardSidebar = ({
  orgId,
  plan,
  orgs,
  UserData,
}: Props) => {
  const pathname = usePathname()
  const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
  useCloseSidebarOnNavigation()
  const { mutate: switchOrg, isPending } = useSwitchOrg()
  const items = [
    {
      title: "Dashboard",
      url: `/organization/${orgId}/dashboard/analytics`,
      icon: BarChart3,
    },
    {
      title: "Affiliates",
      url: `/organization/${orgId}/dashboard/affiliates`,
      icon: LinkIcon,
    },
    {
      title: "Payout",
      url: `/organization/${orgId}/dashboard/payout`,
      icon: Users,
    },
    {
      title: "Customization",
      url: `/organization/${orgId}/dashboard/customization`,
      icon: CreditCard,
    },
    {
      title: "Integration",
      url: `/organization/${orgId}/dashboard/integration`,
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
      url: `/organization/${orgId}/dashboard/settings`,
      icon: Settings,
    },
    {
      title: "Manage Domains",
      url: `/organization/${orgId}/dashboard/manageDomains`,
      icon: Globe,
    },
    {
      title: "Support Email",
      url: `/organization/${orgId}/dashboard/supportEmail`,
      icon: MailQuestion,
    },
  ]
  if (plan.plan === "PRO" || plan.plan === "ULTIMATE") {
    items.push({
      title: "Teams",
      url: `/organization/${orgId}/dashboard/teams`,
      icon: Users,
    })
  }
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<
    "create" | "upgrade" | "expired"
  >("create")
  const router = useRouter()
  const { openPortal } = usePaddlePortal(orgId)
  const handleClick = () => {
    setSelectOpen(false)

    // 🧠 Handle FREE users → show upgrade dialog (not redirect)
    if (plan.plan === "FREE") {
      setDialogMode("upgrade")
      setDialogOpen(true)
      return
    }

    // 🧠 Handle expired subscription users (PRO or ULTIMATE)
    if (
      plan.type === "EXPIRED" &&
      (plan.plan === "PRO" || plan.plan === "ULTIMATE")
    ) {
      setDialogMode("expired")
      setDialogOpen(true)
      return
    }

    // 🧠 Handle users that reached org limit and need upgrade
    if (!canCreate) {
      setDialogMode("upgrade")
      setDialogOpen(true)
      return
    }

    // 🧱 Default: open create company dialog
    setDialogMode("create")
    setDialogOpen(true)
  }

  const getUpgradeText = (plan: PlanInfo) => {
    if (plan.plan === "FREE") return "Upgrade or Purchase"
    if (plan.type === "EXPIRED" && plan.plan === "PRO")
      return "Renew Subscription"
    if (plan.type === "EXPIRED" && plan.plan === "ULTIMATE")
      return "Renew Subscription"
    if (plan.type === "PURCHASE" && plan.plan === "PRO")
      return "Purchase Ultimate Bundle"
    if (plan.type === "SUBSCRIPTION" && plan.plan === "PRO") return "Upgrade"
    return ""
  }
  const currentOrg = orgs?.find((o) => o.id === orgId)
  const canCreate =
    isSelfHosted ||
    plan.plan === "ULTIMATE" ||
    (plan.plan === "PRO" && orgs.length < 1)
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center py-4">
        <OrgHeader affiliate={false} isPreview={false} noRedirect />
        <div className="flex items-center space-x-2">
          {/* Org dropdown */}
          <DropdownInput
            label=""
            value={currentOrg?.id ?? ""}
            options={orgs.map((org) => ({
              label: org.name,
              value: org.id,
            }))}
            placeholder="No Org"
            width="w-40"
            onChange={(val) => switchOrg(val)}
            disabled={orgs.length === 0 || isPending}
            includeFooter
            onFooterClick={handleClick}
            selectOpen={selectOpen}
            setSelectOpen={(v) => !dialogOpen && setSelectOpen(v)}
          />
          <AppDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            affiliate={false}
            title={
              dialogMode === "upgrade"
                ? "Upgrade Required"
                : dialogMode === "expired"
                  ? "Plan Expired"
                  : undefined
            }
            description={
              dialogMode === "upgrade"
                ? plan.plan === "FREE"
                  ? "You need to upgrade or purchase a plan to create a new organization."
                  : plan.type === "PURCHASE"
                    ? "You need to purchase the Ultimate bundle to create a new company."
                    : "You need to upgrade to Ultimate to create a new company."
                : dialogMode === "expired"
                  ? `Your ${plan.plan} plan has expired. Please renew to continue accessing premium features.`
                  : undefined
            }
            confirmText={
              dialogMode === "upgrade"
                ? getUpgradeText(plan)
                : dialogMode === "expired"
                  ? "Renew Now"
                  : "OK"
            }
            onConfirm={
              dialogMode === "upgrade" || dialogMode === "expired"
                ? () => {
                    setDialogOpen(false)
                    setTimeout(() => handlePlanRedirect(orgId!, router), 150)
                  }
                : undefined
            }
            showFooter={dialogMode === "upgrade" || dialogMode === "expired"}
          >
            {dialogMode === "create" && (
              <div className="h-full overflow-y-auto max-h-[60vh]">
                <CreateCompany mode="add" embed />
              </div>
            )}
          </AppDialog>
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

      <SidebarFooter className="p-4 space-y-2">
        {/* 🛡️ SELF-HOSTED: Show a "Pro License" badge instead of billing buttons */}
        {isSelfHosted ? (
          <div className="px-3 py-2 mb-2 rounded-md bg-green-500/10 border border-green-500/20">
            <p className="text-xs font-bold text-green-600 text-center uppercase tracking-wider">
              Self-Hosted License
            </p>
          </div>
        ) : (
          <>
            {/* 🆓 FREE USERS → Upgrade or Purchase */}
            {plan.plan === "FREE" && (
              <Link
                href={`/organization/${orgId}/dashboard/pricing`}
                scroll={false}
                className="block w-full"
              >
                <Button className="w-full">Upgrade or Purchase</Button>
              </Link>
            )}

            {/* 💼 PRO PURCHASE USERS → Offer Ultimate purchase */}
            {plan.type === "PURCHASE" && plan.plan === "PRO" && (
              <Link
                href={`/organization/${orgId}/dashboard/pricing`}
                scroll={false}
                className="block w-full"
              >
                <Button className="w-full">Purchase Ultimate Bundle</Button>
              </Link>
            )}

            {/* 🔁 SUBSCRIPTION or EXPIRED → Manage + Purchase */}
            {(plan.type === "SUBSCRIPTION" || plan.type === "EXPIRED") &&
              (plan.plan === "PRO" || plan.plan === "ULTIMATE") && (
                <>
                  {!plan.hasPendingPurchase && (
                    <Button className="w-full" onClick={() => openPortal()}>
                      Manage Subscription
                    </Button>
                  )}
                  <Link
                    href={`/organization/${orgId}/dashboard/pricing`}
                    scroll={false}
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full">
                      {plan.hasPendingPurchase
                        ? "Purchase One-Time Plan"
                        : "Change Plan"}
                    </Button>
                  </Link>
                </>
              )}
          </>
        )}

        <Link href={`/organization/${orgId}/dashboard/profile`}>
          <div className="flex items-center space-x-3 p-2 rounded-md bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{UserData?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {UserData?.email}
              </p>
            </div>
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}

export default OrganizationDashboardSidebar
