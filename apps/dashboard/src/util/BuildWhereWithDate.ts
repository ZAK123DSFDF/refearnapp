import { and, or, sql, SQL } from "drizzle-orm"
import { resolveDateCondition, WithCreatedAtColumn } from "@/util/DateFilter"

export function buildWhereWithDate(
  baseConditions: (SQL<unknown> | undefined)[],
  value: WithCreatedAtColumn,
  year?: number | undefined,
  month?: number | undefined,
  capLast = false,
  months?: { month: number; year: number }[] | undefined
): SQL {
  let dateCondition: SQL | undefined

  if (months && months.length > 0) {
    const monthConds = months
      .map(({ year, month }) => resolveDateCondition(year, month, value))
      .filter(Boolean) as SQL[]
    if (monthConds.length) dateCondition = or(...monthConds)
  } else {
    dateCondition = resolveDateCondition(year, month, value, capLast)
  }

  const conditions = [...baseConditions]
  if (dateCondition) conditions.push(dateCondition)

  return conditions.length > 0 ? (and(...conditions) as SQL) : sql`1=1`
}
