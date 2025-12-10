"use server"
import { organizationPaddleAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
import { saveOrgPaddleWebhookKey } from "@/lib/organizationAction/saveOrgPaddleWebhookKey"
import { getWebhookKey } from "@/lib/organizationAction/getWebhookKey"
import { getTeamAuthAction } from "@/lib/server/getTeamAuthAction"
import { getDB } from "@/db/drizzle"

export async function saveTeamPaddleWebhookKey({
  orgId,
  webhookPublicKey,
}: {
  orgId: string
  webhookPublicKey: string
}): Promise<MutationData> {
  return handleAction("savePaddleWebhookKey", async () => {
    // 🔐 Authorization
    await getTeamAuthAction(orgId)
    await saveOrgPaddleWebhookKey({ orgId, webhookPublicKey })
    return {
      ok: true,
      toast: "✅ Paddle webhook key saved successfully",
    }
  })
}
export async function getTeamOrgWebhookKey(
  orgId: string
): Promise<{ webhookPublicKey: string | null }> {
  return handleAction("getOrgWebhookKey", async () => {
    await getTeamAuthAction(orgId)

    const existing = await getWebhookKey(orgId)

    if (existing.length === 0) {
      return { ok: true, webhookPublicKey: null } as any
    }

    return { ok: true, webhookPublicKey: existing[0].webhookPublicKey } as any
  })
}
export async function deleteTeamOrgPaddleAccount(
  orgId: string
): Promise<MutationData> {
  return handleAction("deletePaddleOrgAccount", async () => {
    await getTeamAuthAction(orgId)
    const db = await getDB()
    await db
      .delete(organizationPaddleAccount)
      .where(eq(organizationPaddleAccount.orgId, orgId))

    return { ok: true, toast: "deleted paddle account" }
  })
}
