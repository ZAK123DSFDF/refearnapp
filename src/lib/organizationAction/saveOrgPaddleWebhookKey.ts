import { organizationPaddleAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

export async function saveOrgPaddleWebhookKey({
  orgId,
  webhookPublicKey,
}: {
  orgId: string
  webhookPublicKey: string
}) {
  if (!orgId || !webhookPublicKey) {
    throw { status: 400, toast: "Missing orgId or webhookPublicKey" }
  }
  const db = await getDB()
  // 🧩 Ensure webhook key is globally unique
  const existingKey = await db
    .select()
    .from(organizationPaddleAccount)
    .where(eq(organizationPaddleAccount.webhookPublicKey, webhookPublicKey))
    .limit(1)

  if (existingKey.length > 0) {
    throw { status: 409, toast: "This webhook key is already registered" }
  }

  // 🔍 Check if org already has a record
  const existingOrg = await db
    .select()
    .from(organizationPaddleAccount)
    .where(eq(organizationPaddleAccount.orgId, orgId))
    .limit(1)

  if (existingOrg.length > 0) {
    await db
      .update(organizationPaddleAccount)
      .set({
        webhookPublicKey,
        updatedAt: new Date(),
      })
      .where(eq(organizationPaddleAccount.orgId, orgId))
  } else {
    await db.insert(organizationPaddleAccount).values({
      orgId,
      webhookPublicKey,
    })
  }
}
