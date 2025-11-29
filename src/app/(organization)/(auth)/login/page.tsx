import React from "react"
import Login from "@/components/pages/Login"
import { redirectIfAuthed } from "@/lib/server/authGuards"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Login Page",
  description: "Login Page",
  url: "https://refearnapp.com/login",
  indexable: false,
})
const loginPage = async () => {
  await redirectIfAuthed()
  return (
    <>
      <Login affiliate={false} />
    </>
  )
}
export default loginPage
