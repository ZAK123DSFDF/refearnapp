// app/(organization)/verify-signup/page.tsx
import InvalidToken from "@/components/pages/InvalidToken"
import VerifyClient from "@/components/pages/VerifyClient"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"

type Props = {
  searchParams: Promise<{ organizationToken?: string }>
}
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Verify Signup Page",
  description: "Verify Signup",
  url: "https://refearnapp.com/verify-signup",
  indexable: false,
})
export default async function VerifySignupPage({ searchParams }: Props) {
  const { organizationToken } = await searchParams

  if (!organizationToken) {
    return (
      <InvalidToken
        affiliate={false}
        message="The signup link is invalid or expired."
      />
    )
  }

  return (
    <VerifyClient affiliate={false} token={organizationToken} mode="signup" />
  )
}
