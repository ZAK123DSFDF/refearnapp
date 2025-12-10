import { organizationPaddleAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

export async function getWebhookKey(orgId: string) {
  const db = await getDB()
  return db
    .select({
      webhookPublicKey: organizationPaddleAccount.webhookPublicKey,
    })
    .from(organizationPaddleAccount)
    .where(eq(organizationPaddleAccount.orgId, orgId))
    .limit(1)
}
