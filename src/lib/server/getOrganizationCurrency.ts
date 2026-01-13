// app/(organization)/organization/[orgId]/dashboard/action.ts

"use server"
import { db } from "@/db/drizzle"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ActionResult } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"

export async function getOrganizationCurrency(
  orgId: string
): Promise<ActionResult<string>> {
  return handleAction("fetching Organization Currency", async () => {
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, orgId),
      columns: {
        currency: true,
      },
    })

    // Return the standard ActionResult shape
    return {
      ok: true,
      data: org?.currency ?? "USD",
    }
  })
}
