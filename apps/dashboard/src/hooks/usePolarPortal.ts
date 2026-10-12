// hooks/usePolarPortal.ts
"use client"

import { useRouter } from "next/navigation"
import { polarConfig } from "@/lib/polarConfig"

export function usePolarPortal(orgId?: string) {
  const router = useRouter()

  const openPortal = () => {
    if (!polarConfig.customerPortalUrl) {
      router.push(
        orgId
          ? `/organization/${orgId}/dashboard/pricing`
          : "/dashboard/pricing"
      )
      return
    }
    window.open(polarConfig.customerPortalUrl, "_blank")
  }

  return { openPortal }
}
