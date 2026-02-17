"use client"

import { useAppQuery } from "@/hooks/useAppQuery"
import { api } from "@/lib/apiClient"
import { Organization } from "@/lib/types/organization/orgAuth"

export function useOrg(orgId?: string, affiliate?: boolean) {
  const context = affiliate ? "affiliate" : "public"
  const { data, isPending, isError, error, refetch } = useAppQuery(
    ["org", orgId, context],
    (id) => api.organization.org([id, context]),
    [orgId!] as const,
    { enabled: !!affiliate && !!orgId }
  )

  return {
    org: data as Organization | undefined,
    isLoading: isPending,
    isError,
    error,
    refetch,
  }
}
