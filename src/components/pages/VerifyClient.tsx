"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { VerifyServer } from "@/lib/server/verifyServer"
import { useRouter } from "next/navigation"
import EmailVerified from "@/components/pages/Email-verified"
import PendingState from "@/components/ui-custom/PendingState"
import ErrorState from "@/components/ui-custom/ErrorState"

export default function VerifyClient({
  token,
  mode,
  affiliate,
}: {
  token: string
  mode: "login" | "signup" | "changeEmail"
  affiliate: boolean
}) {
  const router = useRouter()

  const { isPending, isError, data } = useQuery({
    queryKey: ["verify", token, mode],
    queryFn: async () => {
      if (!token) throw new Error("No token provided")
      return await VerifyServer({
        token,
        mode,
      })
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  })
  const isTeam = data?.tokenRole === "team"
  const customMessages = affiliate
    ? {
        signup: "Your email has been verified. You can now start promoting.",
        login: "Email verified successfully. Go to your dashboard.",
        changeEmail: "Email updated successfully. Go to your dashboard.",
      }
    : isTeam
      ? {
          signup: "Your email has been verified. Go to your team dashboard.",
          login: "Email verified. Go to your team dashboard.",
          changeEmail: "Email changed successfully. Go to your team dashboard.",
        }
      : {
          signup: "Email verified. You can now create your company.",
          login:
            data?.activeOrgId === undefined
              ? "Email verified. You can now create your company."
              : "Email verified. Go to your dashboard.",
          changeEmail: "Email changed successfully. Go to your dashboard.",
        }

  // Redirect if VerifyServer gives redirectUrl
  useEffect(() => {
    if (data?.redirectUrl && !data?.mode) {
      router.push(data.redirectUrl)
    }
  }, [data?.redirectUrl, data?.mode, router])

  if (isPending) {
    return (
      <PendingState
        affiliate={affiliate}
        message={`Verifying your ${mode}...`}
      />
    )
  }

  if (isError || data?.success === false) {
    return (
      <ErrorState
        affiliate={affiliate}
        message={`The ${mode} link is invalid or expired.`}
      />
    )
  }
  if (data?.mode) {
    return (
      <EmailVerified
        affiliate={data.tokenType === "affiliate"}
        isTeam={data.tokenRole === "team"}
        orgId={data.activeOrgId}
        mode={data.mode}
        customMessages={customMessages}
      />
    )
  }
  return null
}
