import InvalidToken from "@/components/pages/InvalidToken"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Affiliate Unknown Page",
  description: "Affiliate Unknown Page",
  url: "https://refearnapp.com/affiliate/unknown",
  indexable: false,
})
const UnknownPage = async () => {
  return <InvalidToken affiliate />
}

export default UnknownPage
