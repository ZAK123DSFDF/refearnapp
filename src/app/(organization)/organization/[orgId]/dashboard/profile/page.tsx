import React from "react"
import Profile from "@/components/pages/Dashboard/Profile/Profile"
import { OrgIdProps } from "@/lib/types/orgId"
import { getUserData } from "@/app/(organization)/organization/[orgId]/dashboard/profile/action"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { ErrorCard } from "@/components/ui-custom/ErrorCard"
import { requireOrganizationWithOrg } from "@/lib/server/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Profile Page",
    description: "Profile Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/profile`,
    indexable: false,
  })
}
const profilePage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  const userResponse = await getUserData()
  if (!userResponse.ok) {
    return <ErrorCard message={userResponse.error || "Something went wrong"} />
  }
  return (
    <>
      <Profile affiliate={false} orgId={orgId} UserData={userResponse.data} />
    </>
  )
}
export default profilePage
