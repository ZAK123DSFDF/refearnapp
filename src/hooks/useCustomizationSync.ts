"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  getAuthCustomization,
  getDashboardCustomization,
  getCustomizations,
} from "@/app/(organization)/organization/[orgId]/dashboard/customization/action"
import { useSetAtom } from "jotai"
import {
  cardCustomizationAtom,
  inputCustomizationAtom,
  checkboxCustomizationAtom,
  buttonCustomizationAtom,
  themeCustomizationAtom,
  notesCustomizationAtom,
  googleButtonCustomizationAtom,
} from "@/store/AuthCustomizationAtom"
import {
  initialCardCustomizationAtom,
  initialInputCustomizationAtom,
  initialCheckboxCustomizationAtom,
  initialButtonCustomizationAtom,
  initialThemeCustomizationAtom,
  initialNotesCustomizationAtom,
  initialGoogleButtonCustomizationAtom,
} from "@/store/AuthChangesAtom"
import {
  sidebarCustomizationAtom,
  dashboardCardCustomizationAtom,
  dashboardThemeCustomizationAtom,
  dashboardButtonCustomizationAtom,
  tableCustomizationAtom,
  dialogCustomizationAtom,
  yearSelectCustomizationAtom,
  toastCustomizationAtom,
  kpiCardCustomizationAtom,
  chartCustomizationAtom,
  pieChartColorCustomizationAtom,
  logoutButtonCustomizationAtom,
} from "@/store/DashboardCustomizationAtom"
import {
  initialSidebarCustomizationAtom,
  initialDashboardCardCustomizationAtom,
  initialDashboardThemeCustomizationAtom,
  initialDashboardButtonCustomizationAtom,
  initialTableCustomizationAtom,
  initialDialogCustomizationAtom,
  initialYearSelectCustomizationAtom,
  initialToastCustomizationAtom,
  initialKpiCardCustomizationAtom,
  initialChartCustomizationAtom,
  initialPieChartColorCustomizationAtom,
  initialLogoutButtonCustomizationAtom,
} from "@/store/DashboardChangesAtom"
import { AuthCustomization } from "@/customization/Auth/defaultAuthCustomization"
import { DashboardCustomization } from "@/customization/Dashboard/defaultDashboardCustomization"

type CustomizationType = "auth" | "dashboard" | "both"

export function useCustomizationSync(
  orgId?: string,
  type: CustomizationType = "both"
) {
  // Auth
  const setCard = useSetAtom(cardCustomizationAtom)
  const setInput = useSetAtom(inputCustomizationAtom)
  const setCheckbox = useSetAtom(checkboxCustomizationAtom)
  const setButton = useSetAtom(buttonCustomizationAtom)
  const setTheme = useSetAtom(themeCustomizationAtom)
  const setGoogleButton = useSetAtom(googleButtonCustomizationAtom)
  const setNotes = useSetAtom(notesCustomizationAtom)

  const setInitialCard = useSetAtom(initialCardCustomizationAtom)
  const setInitialInput = useSetAtom(initialInputCustomizationAtom)
  const setInitialCheckbox = useSetAtom(initialCheckboxCustomizationAtom)
  const setInitialButton = useSetAtom(initialButtonCustomizationAtom)
  const setInitialTheme = useSetAtom(initialThemeCustomizationAtom)
  const setInitialGoogleButton = useSetAtom(
    initialGoogleButtonCustomizationAtom
  )
  const setInitialNotes = useSetAtom(initialNotesCustomizationAtom)

  // Dashboard
  const setSidebar = useSetAtom(sidebarCustomizationAtom)
  const setDashboardCard = useSetAtom(dashboardCardCustomizationAtom)
  const setDashboardTheme = useSetAtom(dashboardThemeCustomizationAtom)
  const setDashboardButton = useSetAtom(dashboardButtonCustomizationAtom)
  const setTable = useSetAtom(tableCustomizationAtom)
  const setDialog = useSetAtom(dialogCustomizationAtom)
  const setYearSelect = useSetAtom(yearSelectCustomizationAtom)
  const setToast = useSetAtom(toastCustomizationAtom)
  const setKpiCard = useSetAtom(kpiCardCustomizationAtom)
  const setChart = useSetAtom(chartCustomizationAtom)
  const setPieChartColor = useSetAtom(pieChartColorCustomizationAtom)
  const setLogoutButton = useSetAtom(logoutButtonCustomizationAtom)

  const setInitialSidebar = useSetAtom(initialSidebarCustomizationAtom)
  const setInitialDashboardCard = useSetAtom(
    initialDashboardCardCustomizationAtom
  )
  const setInitialDashboardTheme = useSetAtom(
    initialDashboardThemeCustomizationAtom
  )
  const setInitialDashboardButton = useSetAtom(
    initialDashboardButtonCustomizationAtom
  )
  const setInitialTable = useSetAtom(initialTableCustomizationAtom)
  const setInitialDialog = useSetAtom(initialDialogCustomizationAtom)
  const setInitialYearSelect = useSetAtom(initialYearSelectCustomizationAtom)
  const setInitialToast = useSetAtom(initialToastCustomizationAtom)
  const setInitialKpiCard = useSetAtom(initialKpiCardCustomizationAtom)
  const setInitialChart = useSetAtom(initialChartCustomizationAtom)
  const setInitialPieChartColor = useSetAtom(
    initialPieChartColorCustomizationAtom
  )
  const setInitialLogoutButton = useSetAtom(
    initialLogoutButtonCustomizationAtom
  )

  const query = useQuery({
    queryKey: ["customizations", type, orgId],
    queryFn: async () => {
      if (!orgId) return { auth: {}, dashboard: {} }
      if (type === "auth") {
        const auth = await getAuthCustomization(orgId)
        return { auth, dashboard: {} }
      }
      if (type === "dashboard") {
        const dashboard = await getDashboardCustomization(orgId)
        return { auth: {}, dashboard }
      }
      return await getCustomizations(orgId)
    },
    enabled: !!orgId,
  })

  useEffect(() => {
    if (!query.data) return

    const { auth, dashboard } = query.data

    // Sync Auth
    if (auth && Object.keys(auth).length > 0) {
      const typedAuth = auth as Partial<AuthCustomization>
      if (typedAuth.useCardCustomization) {
        setCard(typedAuth.useCardCustomization)
        setInitialCard(typedAuth.useCardCustomization)
      }
      if (typedAuth.useInputCustomization) {
        setInput(typedAuth.useInputCustomization)
        setInitialInput(typedAuth.useInputCustomization)
      }
      if (typedAuth.useCheckboxCustomization) {
        setCheckbox(typedAuth.useCheckboxCustomization)
        setInitialCheckbox(typedAuth.useCheckboxCustomization)
      }
      if (typedAuth.useButtonCustomization) {
        setButton(typedAuth.useButtonCustomization)
        setInitialButton(typedAuth.useButtonCustomization)
      }
      if (typedAuth.useThemeCustomization) {
        setTheme(typedAuth.useThemeCustomization)
        setInitialTheme(typedAuth.useThemeCustomization)
      }
      if (typedAuth.useNotesCustomization) {
        setNotes(typedAuth.useNotesCustomization)
        setInitialNotes(typedAuth.useNotesCustomization)
      }
      if (typedAuth.useGoogleButtonCustomization) {
        setInitialGoogleButton(typedAuth.useGoogleButtonCustomization)
        setGoogleButton(typedAuth.useGoogleButtonCustomization)
      }
    }

    // Sync Dashboard
    if (dashboard && Object.keys(dashboard).length > 0) {
      const typedDashboard = dashboard as Partial<DashboardCustomization>
      if (typedDashboard.useSidebarCustomization) {
        setSidebar(typedDashboard.useSidebarCustomization)
        setInitialSidebar(typedDashboard.useSidebarCustomization)
      }
      if (typedDashboard.useDashboardCardCustomization) {
        setDashboardCard(typedDashboard.useDashboardCardCustomization)
        setInitialDashboardCard(typedDashboard.useDashboardCardCustomization)
      }
      if (typedDashboard.useDashboardThemeCustomization) {
        setDashboardTheme(typedDashboard.useDashboardThemeCustomization)
        setInitialDashboardTheme(typedDashboard.useDashboardThemeCustomization)
      }
      if (typedDashboard.useDashboardButtonCustomization) {
        setDashboardButton(typedDashboard.useDashboardButtonCustomization)
        setInitialDashboardButton(
          typedDashboard.useDashboardButtonCustomization
        )
      }
      if (typedDashboard.useTableCustomization) {
        setTable(typedDashboard.useTableCustomization)
        setInitialTable(typedDashboard.useTableCustomization)
      }
      if (typedDashboard.useDialogCustomization) {
        setDialog(typedDashboard.useDialogCustomization)
        setInitialDialog(typedDashboard.useDialogCustomization)
      }
      if (typedDashboard.useYearSelectCustomization) {
        setYearSelect(typedDashboard.useYearSelectCustomization)
        setInitialYearSelect(typedDashboard.useYearSelectCustomization)
      }
      if (typedDashboard.useToastCustomization) {
        setToast(typedDashboard.useToastCustomization)
        setInitialToast(typedDashboard.useToastCustomization)
      }
      if (typedDashboard.useKpiCardCustomization) {
        setKpiCard(typedDashboard.useKpiCardCustomization)
        setInitialKpiCard(typedDashboard.useKpiCardCustomization)
      }
      if (typedDashboard.useChartCustomization) {
        setChart(typedDashboard.useChartCustomization)
        setInitialChart(typedDashboard.useChartCustomization)
      }
      if (typedDashboard.usePieChartColorCustomization) {
        setPieChartColor(typedDashboard.usePieChartColorCustomization)
        setInitialPieChartColor(typedDashboard.usePieChartColorCustomization)
      }
      if (typedDashboard.useLogoutButtonCustomization) {
        setLogoutButton(typedDashboard.useLogoutButtonCustomization)
        setInitialLogoutButton(typedDashboard.useLogoutButtonCustomization)
      }
    }
  }, [query.data])

  return query
}
