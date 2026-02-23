"use client"

import { useRouter } from "next/navigation"
import { paddleConfig } from "@repo/paddle"

export function usePaddlePortal(orgId?: string) {
  const router = useRouter()

  const openPortal = () => {
    if (!paddleConfig.portal) {
      console.warn("⚠️ Paddle customer portal not configured for production.")

      if (orgId) {
        router.push(`/organization/${orgId}/dashboard/pricing`)
      } else {
        router.push("/dashboard/pricing")
      }

      return
    }

    window.open(paddleConfig.portal, "_blank")
  }

  return { openPortal }
}
