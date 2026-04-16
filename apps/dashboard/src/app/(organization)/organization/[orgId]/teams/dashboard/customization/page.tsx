import React from "react"
import CustomizationPage from "@/components/pages/Dashboard/Customization/CustomizationPage"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireTeamWithOrg } from "@/lib/server/auth/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
import { getLicense } from "@/lib/server/organization/getLicense"
import { getUnifiedPlan } from "@/lib/server/organization/getUnifiedPlan"
import { LicenseRequiredState } from "@/components/ui-custom/LicenseRequiredState"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Customization Page",
    description: "Teams Customization Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/dashboard/customization`,
    indexable: false,
  })
}
export default async function CustomizationServerPage({ params }: OrgIdProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireTeamWithOrg(orgId)
  const licenseResult = await getLicense(orgId)
  const plan = await getUnifiedPlan(orgId)
  let licenseData = null

  if (licenseResult !== null) {
    if (!licenseResult.ok) {
      return (
        <LicenseRequiredState
          featureName="Customization Options"
          requiredTier="PRO"
          isExpired={true}
          orgId={orgId}
        />
      )
    }

    const license = licenseResult.data
    const hasAccess =
      license.isActive &&
      (license.isPro || license.isUltimate) &&
      !!license.activationId

    if (!hasAccess) {
      const needsActivation = !license.activationId && !license.isCommunity
      return (
        <LicenseRequiredState
          featureName="Customization Options"
          requiredTier="PRO"
          isExpired={!license.isActive}
          needsActivation={needsActivation}
          orgId={orgId}
        />
      )
    }
    licenseData = license
  }
  return (
    <div className="overflow-auto">
      <CustomizationPage
        orgId={orgId}
        isTeam
        plan={plan}
        license={licenseData}
      />
    </div>
  )
}
