import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { ActionResult } from "@/lib/types/response"
import { UnpaidMonth } from "@/lib/types/unpaidMonth"

interface UseAppQueryOptions {
  enabled?: boolean
}

interface AppQueryResult<TData> {
  data: TData | undefined
  error: string | undefined
  isPending: boolean
  queryResult: UseQueryResult<{ data?: TData; toast?: string }>
}

export function useAppQuery<Args extends unknown[], TData>(
  queryKey: (string | number | undefined | UnpaidMonth[])[],
  fetchFn: (...args: Args) => Promise<ActionResult<TData>>,
  fetchArgs: Args,
  options?: UseAppQueryOptions
): AppQueryResult<TData> {
  const queryResult = useQuery<{ data?: TData; toast?: string }>({
    queryKey,
    queryFn: async () => {
      const res = await fetchFn(...fetchArgs)
      if (res.ok) return { data: res.data }
      return { toast: res.toast }
    },
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    data: queryResult.data?.data,
    error: queryResult.data?.toast,
    isPending: queryResult.isPending,
    queryResult,
  }
}
