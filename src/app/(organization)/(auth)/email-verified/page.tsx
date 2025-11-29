import { redirect } from "next/navigation"
import EmailVerified from "@/components/pages/Email-verified"
import { getOrganizationAuth } from "@/lib/server/getOrganizationAuth"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Email Verified Page",
  description: "Email Verified Page",
  url: "https://refearnapp.com/email-verified",
  indexable: false,
})
export default async function EmailVerifiedPage() {
  const decoded = await getOrganizationAuth()
  if (!decoded) {
    redirect("/login")
  }
  return <EmailVerified orgId={decoded.activeOrgId} affiliate={false} />
}
