"use client"

import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Form } from "@/components/ui/form"
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
  Lock,
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
import { usePaddlePortal } from "@/hooks/usePaddlePortal"
import { handlePlanRedirect } from "@/util/HandlePlanRedirect"
import { OrgHeader } from "@/components/ui-custom/OrgHeader"
import { useCloseSidebarOnNavigation } from "@/hooks/useCloseSidebarOnNavigation"
import { SystemUpdate } from "@/components/ui-custom/SystemUpdate"
import { SidebarHelp } from "@/components/ui-custom/SidebarHelp"
import { UserLicense } from "@/lib/server/organization/getLicense"
import { useAccess } from "@/hooks/useAccess"
import { useForm } from "react-hook-form"
import { licenseSchema } from "@/lib/schema/licenseSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppMutation } from "@/hooks/useAppMutation"
import {
  activateLicense,
  deactivateLicense,
} from "@/app/(organization)/organization/[orgId]/dashboard/action"
import { InputField } from "@/components/Auth/FormFields"
import { SidebarBilling } from "@/components/ui-custom/Sidebar/SidebarBilling"
import { SidebarDiscord } from "@/components/ui-custom/Sidebar/SidebarDiscord"

// Menu items for the sidebar

type Props = {
  orgId?: string
  plan: PlanInfo
  orgs: { id: string; name: string }[]
  UserData: OrganizationData | null
  updateInfo?: { isNewer: boolean; latestVersion: string; url: string } | null
  license: UserLicense | null
}
const OrganizationDashboardSidebar = ({
  orgId,
  plan,
  orgs,
  UserData,
  updateInfo,
  license,
}: Props) => {
  const pathname = usePathname()
  const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
  useCloseSidebarOnNavigation()
  const form = useForm<z.infer<typeof licenseSchema>>({
    resolver: zodResolver(licenseSchema),
    defaultValues: { licenseKey: "" },
  })
  const { canAccessPro, canAccessUltimate } = useAccess(license)
  const isLocked = (itemTitle: string) => {
    if (isSelfHosted) {
      if (["Teams", "Coupons"].includes(itemTitle)) return !canAccessUltimate
      if (["Customization", "Dashboard"].includes(itemTitle))
        return !canAccessPro
    }
    return false
  }
  const isPremium = isSelfHosted
    ? !!((license?.isPro || license?.isUltimate) && !!license?.activationId)
    : plan.plan === "PRO" || plan.plan === "ULTIMATE"

  const isUltimate = isSelfHosted
    ? !!(license?.isUltimate && !!license?.activationId)
    : plan.plan === "ULTIMATE"
  const { mutate: switchOrg, isPending } = useSwitchOrg()
  const navigationGroups = [
    {
      label: "Activity",
      items: [
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
      ],
    },
    {
      label: "Promotion",
      items: [
        {
          title: "Coupons",
          url: `/organization/${orgId}/dashboard/coupons`,
          icon: TicketPercent,
        },
        {
          title: "Referrals",
          url: `/organization/${orgId}/dashboard/referrals`,
          icon: MousePointerClick,
        },
      ],
    },
    // 👥 NEW: Collaboration Section (Only shows if they have access)
    ...(plan.plan === "PRO" || plan.plan === "ULTIMATE"
      ? [
          {
            label: "Organization",
            items: [
              {
                title: "Teams",
                url: `/organization/${orgId}/dashboard/teams`,
                icon: Users,
              },
            ],
          },
        ]
      : []),
    {
      label: "Configuration",
      items: [
        {
          title: "Integration",
          url: `/organization/${orgId}/dashboard/integration`,
          icon: Layers,
        },

        {
          title: "Customization",
          url: `/organization/${orgId}/dashboard/customization`,
          icon: CreditCard,
        },
        {
          title: "Manage Domains",
          url: `/organization/${orgId}/dashboard/manageDomains`,
          icon: Globe,
        },
        {
          title: "Settings",
          url: `/organization/${orgId}/dashboard/settings`,
          icon: Settings,
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
      ],
    },
  ]
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const [licenseModalOpen, setLicenseModalOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<
    "create" | "upgrade" | "expired"
  >("create")
  const router = useRouter()
  const { openPortal } = usePaddlePortal(orgId)
  const activateMutation = useAppMutation(
    (values: z.infer<typeof licenseSchema>) =>
      activateLicense(orgId!, values.licenseKey),
    {
      onSuccess: () => {
        setLicenseModalOpen(false)
        form.reset()
        router.refresh()
      },
    }
  )
  const deactivateMutation = useAppMutation(
    () => {
      if (!license?.activationId) return Promise.reject("No activation ID")
      return deactivateLicense(orgId!, license.activationId)
    },
    {
      onSuccess: () => router.refresh(),
    }
  )
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
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
              {group.label}
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const locked = isLocked(item.title)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                          {locked && (
                            <Lock className="ml-auto w-3 h-3 text-amber-500" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup className="mt-auto border-t border-border/40 pt-4">
          <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
            Account & Support
          </div>
          <SidebarGroupContent className="px-4 space-y-4">
            <SidebarDiscord
              orgId={orgId!}
              isPremium={isPremium}
              isUltimate={isUltimate}
            />
            <SidebarBilling
              orgId={orgId!}
              isSelfHosted={isSelfHosted}
              plan={plan}
              license={license}
              onOpenLicenseModal={() => setLicenseModalOpen(true)}
              onDeactivateLicense={() => deactivateMutation.mutate(undefined)}
              isDeactivating={deactivateMutation.isPending}
              onOpenPortal={openPortal}
            />
            <div className="flex items-center gap-2 pb-4">
              <div className="flex-1">
                <SidebarHelp />
              </div>
              <div className="flex-1">
                <SystemUpdate variant="badge" updateInfo={updateInfo} />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <AppDialog
          open={licenseModalOpen}
          onOpenChange={setLicenseModalOpen}
          title="Activate License"
          description="Enter your license key to activate or update your premium features."
          confirmText={
            activateMutation.isPending ? "Activating..." : "Activate"
          }
          confirmLoading={activateMutation.isPending}
          onConfirm={form.handleSubmit((values) =>
            activateMutation.mutate(values)
          )}
          confirmDisabled={activateMutation.isPending}
          affiliate={false}
        >
          <Form {...form}>
            <form className="space-y-4">
              <InputField
                control={form.control}
                name="licenseKey"
                label="License Key"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                type="text"
                affiliate={false}
              />
            </form>
          </Form>
        </AppDialog>
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
