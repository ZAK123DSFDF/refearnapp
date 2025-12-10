import { getDB } from "@/db/drizzle"

export async function getSubscriptionExpiration(subscriptionId: string) {
  const db = await getDB()
  return db.query.subscriptionExpiration.findFirst({
    where: (exp, { eq }) => eq(exp.subscriptionId, subscriptionId),
  })
}
