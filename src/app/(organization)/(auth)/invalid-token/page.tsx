import InvalidToken from "@/components/pages/InvalidToken"
import { redirectIfAuthed } from "@/lib/server/authGuards"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Invalid Token Page",
  description: "Invalid Token Page",
  url: "https://refearnapp.com/invalid-token",
  indexable: false,
})
const InvalidTokenPage = async () => {
  await redirectIfAuthed()
  return (
    <>
      <InvalidToken affiliate={false} />
    </>
  )
}

export default InvalidTokenPage
