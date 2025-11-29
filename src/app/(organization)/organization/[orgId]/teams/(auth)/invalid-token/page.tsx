import InvalidToken from "@/components/pages/InvalidToken"
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
    title: "RefearnApp | Teams Invalid Token Page",
    description: "Teams Invalid Token Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/invalid-token`,
    indexable: false,
  })
}
const InvalidTokenPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await redirectTeamIfAuthed(orgId)
  return (
    <>
      <InvalidToken affiliate={false} />
    </>
  )
}

export default InvalidTokenPage
