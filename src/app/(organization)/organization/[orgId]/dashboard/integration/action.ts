"use server"

import { organizationPaddleAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getOrgAuth } from "@/lib/server/GetOrgAuth"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
import { saveOrgPaddleWebhookKey } from "@/lib/organizationAction/saveOrgPaddleWebhookKey"
import { getWebhookKey } from "@/lib/organizationAction/getWebhookKey"
import { getDB } from "@/db/drizzle"

export async function savePaddleWebhookKey({
  orgId,
  webhookPublicKey,
}: {
  orgId: string
  webhookPublicKey: string
}): Promise<MutationData> {
  return handleAction("savePaddleWebhookKey", async () => {
    // 🔐 Authorization
    await getOrgAuth(orgId)
    await saveOrgPaddleWebhookKey({ orgId, webhookPublicKey })
    return {
      ok: true,
      toast: "✅ Paddle webhook key saved successfully",
    }
  })
}
export async function getOrgWebhookKey(
  orgId: string
): Promise<{ webhookPublicKey: string | null }> {
  return handleAction("getOrgWebhookKey", async () => {
    await getOrgAuth(orgId)

    const existing = await getWebhookKey(orgId)

    if (existing.length === 0) {
      return { ok: true, webhookPublicKey: null } as any
    }

    return { ok: true, webhookPublicKey: existing[0].webhookPublicKey } as any
  })
}
export async function deleteOrgPaddleAccount(
  orgId: string
): Promise<MutationData> {
  return handleAction("deletePaddleOrgAccount", async () => {
    await getOrgAuth(orgId)
    const db = await getDB()
    await db
      .delete(organizationPaddleAccount)
      .where(eq(organizationPaddleAccount.orgId, orgId))

    return { ok: true, toast: "deleted paddle account" }
  })
}
