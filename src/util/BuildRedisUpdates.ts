export function buildRedisUpdates(
  source: Record<string, any>,
  allowedFields: Set<string>
): Record<string, any> {
  // Changed return type to any
  const redisUpdates: Record<string, any> = {}

  for (const [key, value] of Object.entries(source)) {
    if (!allowedFields.has(key)) continue
    if (value === undefined || value === null) {
      if (value === null) redisUpdates[key] = null
      continue
    }

    if (value instanceof Date) {
      redisUpdates[key] = value.toISOString()
    } else {
      // Keep numbers as numbers, strings as strings
      redisUpdates[key] = value
    }
  }

  return redisUpdates
}
