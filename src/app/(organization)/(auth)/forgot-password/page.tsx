import React from "react"
import ForgotPassword from "@/components/pages/Forgot-password"
import { redirectIfAuthed } from "@/lib/server/authGuards"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Forgot Password Page",
  description: "Forgot Password Page",
  url: "https://refearnapp.com/forgot-password",
  indexable: false,
})
const forgetPasswordPage = async () => {
  await redirectIfAuthed()
  return (
    <>
      <ForgotPassword affiliate={false} />
    </>
  )
}
export default forgetPasswordPage
