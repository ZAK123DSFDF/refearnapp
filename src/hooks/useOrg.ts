"use client"

import { useAppQuery } from "@/hooks/useAppQuery"
import { api } from "@/lib/apiClient"
import { Organization } from "@/lib/types/organization/orgAuth"

export function useOrg(orgId?: string, affiliate?: boolean) {
  const { data, isPending, isError, error, refetch } = useAppQuery(
    ["org", orgId],
    (id) => api.organization.org([id]),
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
