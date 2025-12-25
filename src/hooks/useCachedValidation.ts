import { useAtom } from "jotai"
import { getCacheAtom } from "@/store/CacheAtom"
import { buildCacheScope } from "@/util/CacheUtils"
import { useEffect, useMemo } from "react"

export function useCachedValidation({
  id,
  orgId,
  affiliate,
  showError,
  errorMessage,
  maxCacheSize = 10,
  cacheDurationMs,
}: {
  id: string
  orgId?: string
  affiliate: boolean
  showError: (msg: string) => void
  errorMessage: string
  maxCacheSize?: number
  cacheDurationMs?: number
}) {
  const cacheScope = buildCacheScope(affiliate, orgId)
  const atom = useMemo(() => getCacheAtom(id, cacheScope), [id, cacheScope])
  const [cache, setCache] = useAtom(atom)

  const EXPIRY_MS = cacheDurationMs ?? 5 * 60 * 1000
  useEffect(() => {
    const interval = setInterval(() => {
      setCache((prev) => {
        if (Date.now() - prev.timestamp > EXPIRY_MS) {
          return {
            failedValues: [],
            errorMessage: null,
            maxCacheSize,
            timestamp: Date.now(),
          }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [maxCacheSize, setCache])
  function shouldSkip(value: string, customMessage?: string): boolean {
    const trimmed = value.trim()
    if (cache.failedValues.includes(trimmed)) {
      showError(customMessage || errorMessage)
      return true
    }
    return false
  }

  function addFailedValue(value: string) {
    const trimmed = value.trim()
    if (!cache.failedValues.includes(trimmed)) {
      const updated = [...cache.failedValues, trimmed].slice(-maxCacheSize)
      setCache({ ...cache, failedValues: updated })
    }
  }
  return { shouldSkip, addFailedValue }
}
