import { returnError } from "@/lib/errorHandler"
import { MutationData, ActionResult } from "@/lib/types/response"

/**
 * Generic wrapper for async server actions.
 * Handles try/catch, logging, and optional timing — without changing your return shape.
 *
 * You control what to return (`ResponseData`, `MutationData`, or any custom shape).
 *
 * @param name - A label for console logs (use null to skip label)
 * @param fn - The async function to execute
 * @param measureTime - Whether to log execution time (default: true)
 */
export async function handleAction<T extends ActionResult<any> | MutationData>(
  name: string | null,
  fn: () => Promise<T>,
  measureTime: boolean = true
): Promise<T> {
  const label = name ? `${name}` : "Unnamed Action"
  const start = measureTime ? performance.now() : 0

  try {
    const result = await fn()

    if (measureTime) {
      const end = performance.now()
      console.info(`✅ ${label} completed in ${Math.round(end - start)}ms`)
    }

    return result
  } catch (err) {
    console.error(`${label} error:`, err)
    return returnError(err) as T
  }
}
