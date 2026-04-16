"use client"
import React, { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AuthCustomization } from "@/components/pages/Dashboard/Customization/AuthCustomization"
import { DashboardCustomization } from "@/components/pages/Dashboard/Customization/DashboardCustomization"
import { ToastCustomization } from "@/components/ui-custom/Customization/ToastCustomization"
import { useQueryClient } from "@tanstack/react-query"
import { saveCustomizationsAction } from "@/app/(organization)/organization/[orgId]/dashboard/customization/action"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useAtom, useAtomValue } from "jotai"
import { authHasChangesAtom } from "@/store/AuthChangesAtom"
import { dashboardHasChangesAtom } from "@/store/DashboardChangesAtom"
import { useLiveCustomizations } from "@/store/LiveCustomizationAtom"
import { GlobalCustomizationProvider } from "@/components/pages/Dashboard/Customization/GlobalCustomizationProvider"
import { Switch } from "@/components/ui/switch"
import { showMissingPaypalAtom } from "@/store/MissingPaypalAtom"
import { useActiveDomain } from "@/hooks/useActiveDomain"
import { AppResponse, useAppMutation } from "@/hooks/useAppMutation"
import { previewSimulationAtom } from "@/store/PreviewSimulationAtom"
import { cn } from "@/lib/utils"
import { saveTeamCustomizationsAction } from "@/app/(organization)/organization/[orgId]/teams/dashboard/customization/action"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SimulationInfoCard } from "@/components/ui-custom/SimulationInfoCard"
import { showNotificationAtom } from "@/store/ShowNotificationAtom"
import { UserLicense } from "@/lib/server/organization/getLicense"

export default function CustomizationPage({
  orgId,
  isTeam = false,
  plan,
}: {
  orgId: string
  isTeam?: boolean
  plan: "FREE" | "PRO" | "ULTIMATE"
}) {
  const [mainTab, setMainTab] = useState("sidebar")
  const [selectedPage, setSelectedPage] = useState("dashboard")
  const [tab, setTab] = useState("login")
  const { domainName } = useActiveDomain(orgId)
  useVerifyTeamSession(orgId, isTeam)
  const authHasChanges = useAtomValue(authHasChangesAtom)
  const dashboardHasChanges = useAtomValue(dashboardHasChangesAtom)
  const [showNotification, setShowNotification] = useAtom(showNotificationAtom)
  const [showMissingPaypal, setShowMissingPaypal] = useAtom(
    showMissingPaypalAtom
  )
  const [previewSimulation, setPreviewSimulation] = useAtom(
    previewSimulationAtom
  )
  const hasChanges = authHasChanges || dashboardHasChanges
  const liveCustomizations = useLiveCustomizations()
  const queryClient = useQueryClient()
  const mutation = useAppMutation<AppResponse, void>(
    async () => {
      console.log("🟢 Changes before send:", liveCustomizations)

      if (!hasChanges) {
        console.log("⚪ No changes to save")
        return { ok: true, message: "No changes to save." } // keep same shape as your backend responses
      }

      const saveFn = isTeam
        ? saveTeamCustomizationsAction
        : saveCustomizationsAction

      return saveFn(orgId, liveCustomizations)
    },
    {
      onSuccess: async (res) => {
        if (res.ok) {
          console.log("✅ Customizations saved")
          await queryClient.invalidateQueries({
            queryKey: ["customizations", "both", orgId],
          })
          console.log("invalidated")
        }
      },
    }
  )

  const router = useRouter()
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.size > 0) {
      router.replace("?", { scroll: false })
    }
  }, [router, searchParams.size])
  return (
    <GlobalCustomizationProvider affiliate orgId={orgId}>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            Customize Your Affiliate Page
          </h2>
          <p className="text-sm text-muted-foreground">
            Adjust colors and layout settings to match your brand.
          </p>
        </div>

        {/* Toast Inputs */}
        <div className="space-y-2">
          <ToastCustomization />
        </div>

        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="sidebar">Dashboard</TabsTrigger>
              <TabsTrigger value="auth">Auth Pages</TabsTrigger>
            </TabsList>
            {mainTab === "sidebar" && (
              <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="toggle-missing-paypal"
                    checked={showMissingPaypal}
                    onCheckedChange={setShowMissingPaypal}
                  />
                  <label
                    htmlFor="toggle-missing-paypal"
                    className="text-sm text-muted-foreground"
                  >
                    Show Missing PayPal Card
                  </label>
                </div>
                {/* Simulate Loading */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="simulate-loading"
                    checked={previewSimulation === "loading"}
                    onCheckedChange={(checked) =>
                      setPreviewSimulation(checked ? "loading" : "none")
                    }
                    disabled={
                      previewSimulation === "error" ||
                      previewSimulation === "empty"
                    }
                  />
                  <label
                    htmlFor="simulate-loading"
                    className={cn(
                      "text-sm",
                      previewSimulation === "error" ||
                        previewSimulation === "empty"
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground"
                    )}
                  >
                    Show Loading
                  </label>
                </div>

                {/* Simulate Error */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="simulate-error"
                    checked={previewSimulation === "error"}
                    onCheckedChange={(checked) =>
                      setPreviewSimulation(checked ? "error" : "none")
                    }
                    disabled={
                      previewSimulation === "loading" ||
                      previewSimulation === "empty"
                    }
                  />
                  <label
                    htmlFor="simulate-error"
                    className={cn(
                      "text-sm",
                      previewSimulation === "loading" ||
                        previewSimulation === "empty"
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground"
                    )}
                  >
                    Show Error
                  </label>
                </div>

                {/* 🆕 Simulate Empty */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="simulate-empty"
                    checked={previewSimulation === "empty"}
                    onCheckedChange={(checked) =>
                      setPreviewSimulation(checked ? "empty" : "none")
                    }
                    disabled={
                      previewSimulation === "loading" ||
                      previewSimulation === "error"
                    }
                  />
                  <label
                    htmlFor="simulate-empty"
                    className={cn(
                      "text-sm",
                      previewSimulation === "loading" ||
                        previewSimulation === "error"
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground"
                    )}
                  >
                    Show Empty
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="toggle-notifications"
                    checked={showNotification}
                    onCheckedChange={setShowNotification}
                  />
                  <label
                    htmlFor="toggle-notifications"
                    className="text-sm text-muted-foreground"
                  >
                    Show Notifications
                  </label>
                </div>
              </div>
            )}
          </div>
          {mainTab === "auth" && tab === "login" && (
            <SimulationInfoCard
              className="mt-4"
              errorMessage={
                <>
                  <strong>Error State:</strong> enter password{" "}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">
                    incorrect123
                  </code>{" "}
                  to simulate an error.
                </>
              }
              successMessage={
                <>
                  <strong>Success State:</strong> enter any other password to
                  simulate success state.
                </>
              }
            />
          )}
          {mainTab === "auth" && tab === "signup" && (
            <SimulationInfoCard
              className="mt-4"
              errorMessage={
                <>
                  <strong>Error State:</strong> enter email{" "}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">
                    already@used.com
                  </code>{" "}
                  to simulate an error.
                </>
              }
              successMessage={
                <>
                  <strong>Success State:</strong> enter any other email to
                  simulate success state.
                </>
              }
            />
          )}
          {mainTab === "auth" && tab === "forgot-password" && (
            <SimulationInfoCard
              className="mt-4"
              errorMessage={
                <>
                  <strong>Error State:</strong> enter email{" "}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">
                    notfound@gmail.com
                  </code>{" "}
                  to simulate an error.
                </>
              }
              successMessage={
                <>
                  <strong>Success State:</strong> enter any other email to
                  simulate success state.
                </>
              }
            />
          )}
          {mainTab === "auth" && tab === "reset-password" && (
            <SimulationInfoCard
              className="mt-4"
              errorMessage={
                <>
                  <strong>Error State:</strong> set your password to{" "}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">
                    notcorrect123
                  </code>{" "}
                  to simulate an error.
                </>
              }
              successMessage={
                <>
                  <strong>Success State:</strong> enter any other password to
                  simulate a successful password reset.
                </>
              }
            />
          )}
          {mainTab === "sidebar" && selectedPage === "profile" && (
            <>
              <SimulationInfoCard
                className="mb-4"
                errorMessage={
                  <>
                    <strong>Error State:</strong> enter any password{" "}
                    <em>except</em>{" "}
                    <code className="px-1 py-0.5 rounded bg-muted text-xs">
                      correct123
                    </code>{" "}
                    to simulate an incorrect password error.
                  </>
                }
                successMessage={
                  <>
                    <strong>Success State:</strong> enter{" "}
                    <code className="px-1 py-0.5 rounded bg-muted text-xs">
                      correct123
                    </code>{" "}
                    to simulate a successful password update.
                  </>
                }
              />
            </>
          )}

          <TabsContent value="sidebar">
            <SidebarProvider affiliate orgId={orgId}>
              <div className="relative lg:w-full">
                {mainTab === "sidebar" && (
                  <div className="md:hidden p-2">
                    <SidebarTrigger affiliate />
                  </div>
                )}

                <DashboardCustomization
                  orgId={orgId}
                  domain={domainName}
                  selectedPage={selectedPage}
                  setSelectedPage={setSelectedPage}
                />
              </div>
            </SidebarProvider>
          </TabsContent>
          <TabsContent value="auth">
            <SidebarProvider affiliate orgId={orgId}>
              <div className="relative lg:w-full">
                {mainTab === "sidebar" && (
                  <div className="md:hidden p-2">
                    <SidebarTrigger />
                  </div>
                )}

                <AuthCustomization
                  orgId={orgId}
                  setMainTab={setMainTab}
                  domain={domainName}
                  tab={tab}
                  plan={plan}
                  setTab={setTab}
                />
              </div>
            </SidebarProvider>
          </TabsContent>
        </Tabs>

        <div className="pt-4">
          <Button
            onClick={() => mutation.mutate()}
            disabled={!hasChanges || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Customizations"}
          </Button>
        </div>
      </div>
    </GlobalCustomizationProvider>
  )
}
