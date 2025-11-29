import { getUserPlan } from "@/lib/server/getUserPlan"
import PricingClient from "@/components/ui-custom/Pricing/PricingClient"
import { OrgIdProps } from "@/lib/types/orgId"
import { Metadata } from "next"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Pricing Page",
    description: "Pricing Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/pricing`,
    indexable: false,
  })
}
export default async function PricingPage() {
  const plan = await getUserPlan()
  const showSubscription = !(
    (plan?.type === "PURCHASE" &&
      (plan?.plan === "PRO" || plan?.plan === "ULTIMATE")) ||
    (plan?.type === "SUBSCRIPTION" && plan?.hasPendingPurchase)
  )

  return (
    <PricingClient
      plan={plan}
      dashboard={true}
      showSubscription={showSubscription}
    />
  )
}
