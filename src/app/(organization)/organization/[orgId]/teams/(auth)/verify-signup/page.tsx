// app/(organization)/verify-signup/page.tsx
import InvalidToken from "@/components/pages/InvalidToken"
import VerifyClient from "@/components/pages/VerifyClient"
import { OrgIdProps } from "@/lib/types/orgId"
import { Metadata } from "next"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { buildMetadata } from "@/util/BuildMetadata"

type Props = {
  searchParams: Promise<{ teamToken?: string }>
}
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Verify Signup Page",
    description: "Teams Verify Signup Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/verify-signup`,
    indexable: false,
  })
}
export default async function VerifySignupPage({ searchParams }: Props) {
  const { teamToken } = await searchParams

  if (!teamToken) {
    return (
      <InvalidToken
        affiliate={false}
        message="The signup link is invalid or expired."
      />
    )
  }

  return <VerifyClient affiliate={false} token={teamToken} mode="signup" />
}
