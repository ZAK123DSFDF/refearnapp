"use client"

import { useEffect } from "react"
import ErrorFallback from "@/components/pages/ErrorFallback"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error caught by boundary:", error)
  }, [error])

  return <ErrorFallback error={error} reset={reset} />
}
