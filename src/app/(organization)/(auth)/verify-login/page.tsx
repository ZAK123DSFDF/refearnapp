// app/(organization)/verify-login/page.tsx
import InvalidToken from "@/components/pages/InvalidToken"
import VerifyClient from "@/components/pages/VerifyClient"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"

type Props = {
  searchParams: Promise<{ organizationToken?: string }>
}
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Verify Login Page",
  description: "Verify Login",
  url: "https://refearnapp.com/verify-login",
  indexable: false,
})
export default async function VerifyLoginPage({ searchParams }: Props) {
  const { organizationToken } = await searchParams

  if (!organizationToken) {
    return (
      <InvalidToken
        affiliate={false}
        message="The login link is invalid or expired."
      />
    )
  }

  return (
    <VerifyClient affiliate={false} token={organizationToken} mode="login" />
  )
}
