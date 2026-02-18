import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useMemo } from "react"
import { OrderBy } from "@/lib/types/analytics/orderTypes"

type OrderDir = "asc" | "desc"

export function useQueryFilter<TOrderBy extends string = OrderBy>(
  keys: {
    yearKey?: string
    monthKey?: string
    orderByKey?: string
    orderDirKey?: string
    offsetKey?: string
    emailKey?: string
  } = {},
  options: { debounceMs?: number } = {}
) {
  const {
    yearKey = "year",
    monthKey = "month",
    orderByKey = "orderBy",
    orderDirKey = "orderDir",
    offsetKey = "page",
    emailKey = "email",
  } = keys

  const { debounceMs = 3000 } = options

  const router = useRouter()
  const searchParams = useSearchParams()
  const params = Object.fromEntries(searchParams.entries())

  const initialFilters = useMemo(
    () => ({
      year: params[yearKey] ? Number(params[yearKey]) : undefined,
      month: params[monthKey] ? Number(params[monthKey]) : undefined,
      orderBy: (params[orderByKey] as TOrderBy) ?? undefined,
      orderDir: (params[orderDirKey] as OrderDir) ?? undefined,
      offset: params[offsetKey] ? Number(params[offsetKey]) : undefined,
      email: params[emailKey] || undefined,
    }),
    [params, yearKey, monthKey, orderByKey, orderDirKey, offsetKey, emailKey]
  )

  const [filters, setFiltersState] =
    useState<typeof initialFilters>(initialFilters)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  )

  const setFilters = useCallback(
    (newFilters: Partial<typeof initialFilters>) => {
      const applyUpdate = () => {
        const merged = { ...filters, ...newFilters }
        if (merged.year === undefined) merged.month = undefined
        setFiltersState(merged)

        const newParams = new URLSearchParams(searchParams.toString())

        if (merged.year !== undefined)
          newParams.set(yearKey, String(merged.year))
        else newParams.delete(yearKey)

        if (merged.month !== undefined)
          newParams.set(monthKey, String(merged.month))
        else newParams.delete(monthKey)

        if (merged.orderBy) {
          newParams.set(orderByKey, merged.orderBy)
        } else {
          newParams.delete(orderByKey)
          newParams.delete(orderDirKey)
        }

        if (merged.orderDir && merged.orderBy) {
          newParams.set(orderDirKey, merged.orderDir)
        } else {
          newParams.delete(orderDirKey)
        }

        if (merged.offset !== undefined)
          newParams.set(offsetKey, String(merged.offset))
        else newParams.delete(offsetKey)

        if (merged.email !== undefined && merged.email !== "") {
          newParams.set(emailKey, merged.email)
        } else {
          newParams.delete(emailKey)
        }

        router.push(`?${newParams.toString()}`, { scroll: false })
      }
      if ("email" in newFilters) {
        if (debounceTimer) clearTimeout(debounceTimer)
        setDebounceTimer(setTimeout(applyUpdate, debounceMs))
      } else {
        applyUpdate()
      }
    },
    [
      filters,
      debounceTimer,
      debounceMs,
      router,
      searchParams,
      yearKey,
      monthKey,
      orderByKey,
      orderDirKey,
      offsetKey,
      emailKey,
    ]
  )

  return { filters, setFilters }
}
