import React from "react"
import CustomizationPage from "@/components/pages/Dashboard/Customization/CustomizationPage"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireOrganizationWithOrg } from "@/lib/server/auth/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
import { getLicense } from "@/lib/server/organization/getLicense"
import { LicenseRequiredState } from "@/components/ui-custom/LicenseRequiredState"
import { getActiveDomain } from "@/lib/server/organization/getActiveDomain"
import { getUnifiedPlan } from "@/lib/server/organization/getUnifiedPlan"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Customization Page",
    description: "Customization Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/customization`,
    indexable: false,
  })
}
export default async function CustomizationServerPage({ params }: OrgIdProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  const licenseResult = await getLicense(orgId)
  const plan = await getUnifiedPlan(orgId)
  const domain = await getActiveDomain(orgId)
  if (licenseResult !== null) {
    if (!licenseResult.ok) {
      return (
        <LicenseRequiredState
          featureName="Customization Options"
          requiredTier="PRO"
          isExpired={true}
          domainName={domain?.domainName}
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
          domainName={domain?.domainName}
          needsActivation={needsActivation}
          orgId={orgId}
        />
      )
    }
  }
  return (
    <div className="overflow-auto">
      <CustomizationPage orgId={orgId} plan={plan} />
    </div>
  )
}
