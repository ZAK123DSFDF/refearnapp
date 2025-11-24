"use client"

import Link from "next/link"
import { useOrg } from "@/hooks/useOrg"
import { LogoUpload } from "@/components/ui-custom/LogoUpload"
import { ThemeCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/ThemeCustomizationOptions"
import { useAtomValue } from "jotai"
import { themeCustomizationAtom } from "@/store/AuthCustomizationAtom"
import { useOrgLogo } from "@/hooks/useOrgLogo"
import { kpiCardCustomizationAtom } from "@/store/DashboardCustomizationAtom"
import MyCustomIcon from "@/components/ui-custom/MyCustomIcon"

interface OrgHeaderProps {
  orgId?: string
  affiliate: boolean
  isPreview: boolean
  sidebar?: boolean
  noRedirect?: boolean
}

export function OrgHeader({
  orgId,
  affiliate,
  isPreview,
  sidebar,
  noRedirect,
}: OrgHeaderProps) {
  const { org, isLoading: orgLoading } = useOrg(orgId, affiliate)
  const { logoUrl, setLogoUrl } = useOrgLogo(org?.logoUrl)
  const { headerColor } = useAtomValue(themeCustomizationAtom)
  const kpiCard = useAtomValue(kpiCardCustomizationAtom)

  if (affiliate && !orgId) {
    console.warn("Affiliate mode requires a valid orgId.")
    return null
  }

  // -----------------------------
  // ⭐ OPTION A LOGO (clean SVG)
  // -----------------------------
  const Logo = (
    <div className="flex items-center justify-center">
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: "35px",
          height: "35px",
          backgroundImage:
            "linear-gradient(to bottom right, #A5C8FF, #7B87FF, #6A4CFF)",
        }}
      >
        <MyCustomIcon
          width={25}
          height={25}
          className="main-dashboard-graphic"
          aria-label="Custom application graphic"
        />
      </div>
    </div>
  )

  const AppName = (
    <h1 className={`${sidebar ? "text-lg" : "text-2xl"} font-bold`}>
      <span style={{ color: headerColor }}>Refearn</span>
      <span style={{ color: "#3B82F6" }}>App</span>
    </h1>
  )

  // -----------------------------
  // AFFILIATE AND PREVIEW MODE
  // -----------------------------
  if (affiliate || isPreview) {
    if (orgLoading) {
      return (
        <div className="flex items-center justify-center space-x-3">
          <div
            className="h-10 w-10 rounded-full animate-pulse"
            style={{
              backgroundColor:
                (affiliate && kpiCard.kpiLoadingColor) || "rgb(243 244 246)",
            }}
          />
          <div
            className="h-5 w-28 rounded-md animate-pulse"
            style={{
              backgroundColor:
                (affiliate && kpiCard.kpiLoadingColor) || "rgb(243 244 246)",
            }}
          />
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center space-x-2">
        <LogoUpload
          value={logoUrl}
          onChange={setLogoUrl}
          affiliate={affiliate}
          orgId={orgId}
          orgName={org?.name}
          mode="avatar"
        />

        <h1
          className={`${sidebar ? "text-lg" : "text-2xl"} font-bold`}
          style={{ color: (affiliate && headerColor) || undefined }}
        >
          {org?.name || "AffiliateX"}
        </h1>

        {isPreview && (
          <ThemeCustomizationOptions
            name="headerColor"
            showLabel={false}
            buttonSize="w-4 h-4"
          />
        )}
      </div>
    )
  }

  // -----------------------------
  // NO REDIRECT MODE
  // -----------------------------
  if (noRedirect) {
    return (
      <div className="inline-block">
        <div className="flex items-center justify-center space-x-2">
          {Logo}
          {AppName}
        </div>
      </div>
    )
  }

  // -----------------------------
  // NORMAL MODE
  // -----------------------------
  return (
    <Link href="/" className="inline-block cursor-pointer">
      <div className="flex items-center justify-center space-x-2">
        {Logo}
        {AppName}
      </div>
    </Link>
  )
}
