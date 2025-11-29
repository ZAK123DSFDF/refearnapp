import React from "react"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Affiliate Page",
  description: "Affiliate Page",
  url: "https://refearnapp.com/affiliate",
  indexable: false,
})

const affiliatePage = () => {
  return (
    <>
      <div>affiliatePage</div>
    </>
  )
}
export default affiliatePage
