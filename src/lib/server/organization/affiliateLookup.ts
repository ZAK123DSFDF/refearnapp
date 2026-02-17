import { db } from "@/db/drizzle"
import { affiliate } from "@/db/schema"
import { and, eq, ilike, or, SQL } from "drizzle-orm"

export async function getAffiliateLookupAction(
  orgId: string,
  options: { search?: string; limit?: number; offset?: number }
) {
  const { search, limit = 10, offset = 0 } = options

  // 1. Explicitly type the array as SQL fragments
  const filters: (SQL | undefined)[] = [eq(affiliate.organizationId, orgId)]

  if (search) {
    filters.push(
      or(
        ilike(affiliate.name, `%${search}%`),
        ilike(affiliate.email, `%${search}%`)
      )
    )
  }

  // 2. Filter out any undefined elements before spreading into and()
  // The .filter(Boolean) trick tells TS that only truthy values remain
  const cleanFilters = filters.filter((f): f is SQL => !!f)

  return (
    db
      .select({
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
      })
      .from(affiliate)
      // 3. Pass the clean array. If it's empty, and() still works fine.
      .where(and(...cleanFilters))
      .limit(limit)
      .offset(offset)
  )
}
