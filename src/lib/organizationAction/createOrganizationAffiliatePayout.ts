import { payoutReference, payoutReferencePeriods } from "@/db/schema"
import { customAlphabet } from "nanoid"
import { getDB } from "@/db/drizzle"
const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const generateRefId = customAlphabet(alphabet, 8)
export interface CreatePayoutInput {
  orgId: string
  affiliateIds: string[]
  isUnpaid: boolean
  months: { year: number; month?: number }[]
}
export async function createOrganizationAffiliatePayout({
  orgId,
  affiliateIds,
  isUnpaid,
  months,
}: CreatePayoutInput) {
  if (affiliateIds.length === 0) return []
  const insertedRefs: { affiliateId: string; refId: string }[] =
    affiliateIds.map((affiliateId) => ({
      affiliateId,
      refId: generateRefId(),
    }))
  const db = await getDB()
  await db.insert(payoutReference).values(
    insertedRefs.map((r) => ({
      refId: r.refId,
      orgId,
      affiliateId: r.affiliateId,
      isUnpaid,
      createdAt: new Date(),
    }))
  )
  if (months.length > 0) {
    const periodsData = insertedRefs.flatMap((r) =>
      months.map((m) => ({
        refId: r.refId,
        year: m.year,
        month: m.month ?? 0,
      }))
    )

    await db.insert(payoutReferencePeriods).values(periodsData)
  }
  return insertedRefs
}
