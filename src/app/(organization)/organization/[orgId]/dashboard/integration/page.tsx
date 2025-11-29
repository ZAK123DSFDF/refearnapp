import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { OrgIdProps } from "@/lib/types/orgId"
import { requireOrganizationWithOrg } from "@/lib/server/authGuards"
import IntegrationClientPage from "@/components/pages/Dashboard/Integration/IntegrationClientPage"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Integration Page",
    description: "Integration Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/integration`,
    indexable: false,
  })
}
export default async function IntegrationPage({ params }: OrgIdProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)

  return <IntegrationClientPage orgId={orgId} />
}
