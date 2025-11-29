import EmailVerified from "@/components/pages/Email-verified"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { OrgIdProps } from "@/lib/types/orgId"
import { requireTeamWithOrg } from "@/lib/server/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Email Verified Page",
    description: "Teams Email Verified Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/email-verified`,
    indexable: false,
  })
}
export default async function EmailVerifiedPage({ params }: OrgIdProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireTeamWithOrg(orgId)
  return <EmailVerified isTeam orgId={orgId} affiliate={false} />
}
