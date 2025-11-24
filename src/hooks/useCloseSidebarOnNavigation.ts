"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"

export function useCloseSidebarOnNavigation() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    // navigation is complete here
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, searchParams, isMobile, setOpenMobile])
}
