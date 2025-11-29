import React from "react"
import Signup from "@/components/pages/Signup"
import { redirectIfAuthed } from "@/lib/server/authGuards"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Signup Page",
  description: "Signup Page",
  url: "https://refearnapp.com/signup",
  indexable: false,
})
const signupPage = async () => {
  await redirectIfAuthed()
  return (
    <>
      <Signup affiliate={false} />
    </>
  )
}
export default signupPage
