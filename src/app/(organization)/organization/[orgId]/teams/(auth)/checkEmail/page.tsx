import React from "react"
import CheckEmail from "@/components/pages/CheckEmail"
import { redirectTeamIfAuthed } from "@/lib/server/authGuards"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { OrgIdProps } from "@/lib/types/orgId"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Check Email Page",
    description: "Teams Check Email Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/checkEmail`,
    indexable: false,
  })
}
const CheckEmailPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await redirectTeamIfAuthed(orgId)
  return (
    <>
      <CheckEmail affiliate={false} />
    </>
  )
}
export default CheckEmailPage
