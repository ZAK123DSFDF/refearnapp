import React from "react"
import CheckEmail from "@/components/pages/CheckEmail"
import { redirectIfAuthed } from "@/lib/server/authGuards"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Check Your Email Page",
  description: "Check Your Email Page",
  url: "https://refearnapp.com/check-email",
  indexable: false,
})

const CheckEmailPage = async () => {
  await redirectIfAuthed()
  return (
    <>
      <CheckEmail affiliate={false} />
    </>
  )
}
export default CheckEmailPage
