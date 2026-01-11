import { getSubscriptionExpiration } from "@/services/getSubscriptionExpiration"
import { calculateExpirationDate } from "@/util/CalculateExpiration"
import { addDays } from "date-fns"
import { db } from "@/db/drizzle"
import { subscriptionExpiration } from "@/db/schema"
import { eq } from "drizzle-orm"
export async function handleSubscriptionExpiration(
  subscriptionId: string,
  organizationRecord: any,
  trialDays: number = 0
) {
  const existing = await getSubscriptionExpiration(subscriptionId)

  // Calculate the base window (e.g., 2 months)
  let expirationDate = calculateExpirationDate(
    new Date(),
    organizationRecord.commissionDurationValue,
    organizationRecord.commissionDurationUnit
  )

  // Add the trial overhead
  if (trialDays > 0) {
    expirationDate = addDays(expirationDate, trialDays)
  }

  if (existing) {
    await db
      .update(subscriptionExpiration)
      .set({ expirationDate, updatedAt: new Date() })
      .where(eq(subscriptionExpiration.subscriptionId, subscriptionId))
  } else {
    await db.insert(subscriptionExpiration).values({
      subscriptionId,
      expirationDate,
    })
  }
}
