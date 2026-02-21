import { db } from "@/db/drizzle"
import {
  organization,
  ValueType,
  ReferralParam,
  DurationUnit,
  Currency,
  AttributionModel,
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { OrgData } from "@/lib/types/organization/organization"
import { buildRedisUpdates } from "@/util/BuildRedisUpdates"
import { syncOrgDataToRedisLinks } from "@/lib/server/organization/syncOrgDataToRedisLinks"

export async function updateSettings(
  data: Partial<OrgData> & { id: string },
  opts?: { team?: boolean }
): Promise<void> {
  // Create an explicit, typed update object
  // We use InferInsertModel but make everything optional
  const updateData: Partial<typeof organization.$inferInsert> = {}

  if (data.name) updateData.name = data.name.trim()

  if (data.websiteUrl) {
    updateData.websiteUrl = data.websiteUrl.trim().replace(/^https?:\/\//, "")
  }
  if (data.supportEmail !== undefined) {
    updateData.supportEmail = data.supportEmail?.trim().toLowerCase() || null
  }
  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || ""
  }

  if (data.openGraphUrl !== undefined)
    updateData.openGraphUrl = data.openGraphUrl || null
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl || null

  // ENFORCE UPPERCASE for Enums/Strict strings
  if (data.commissionType) {
    updateData.commissionType = data.commissionType.toUpperCase() as ValueType
  }

  if (data.referralParam)
    updateData.referralParam = data.referralParam as ReferralParam
  if (data.currency) updateData.currency = data.currency as Currency
  if (data.attributionModel)
    updateData.attributionModel = data.attributionModel as AttributionModel

  // Handle Units
  if (data.cookieLifetimeUnit)
    updateData.cookieLifetimeUnit = data.cookieLifetimeUnit as DurationUnit
  if (data.commissionDurationUnit)
    updateData.commissionDurationUnit =
      data.commissionDurationUnit as DurationUnit

  // Numbers
  if (data.cookieLifetimeValue !== undefined) {
    updateData.cookieLifetimeValue = Math.round(
      Number(data.cookieLifetimeValue)
    )
  }

  if (data.commissionValue !== undefined) {
    // commissionValue is a numeric/string in DB usually, Drizzle expects string for decimal
    updateData.commissionValue = Number(data.commissionValue).toFixed(2)
  }

  if (data.commissionDurationValue !== undefined) {
    updateData.commissionDurationValue = Math.round(
      Number(data.commissionDurationValue)
    )
  }

  if (Object.keys(updateData).length === 0) return

  // Database Update
  await db
    .update(organization)
    .set(updateData)
    .where(eq(organization.id, data.id))

  // Redis Sync
  const REDIS_ORG_FIELDS = new Set([
    "name",
    "websiteUrl",
    "supportEmail",
    "referralParam",
    "cookieLifetimeValue",
    "cookieLifetimeUnit",
    "commissionType",
    "commissionValue",
    "commissionDurationValue",
    "commissionDurationUnit",
    "attributionModel",
    "currency",
  ])

  const redisUpdates = buildRedisUpdates(updateData, REDIS_ORG_FIELDS)
  if (Object.keys(redisUpdates).length > 0) {
    await syncOrgDataToRedisLinks(data.id, redisUpdates)
  }

  const path = opts?.team
    ? `/organization/${data.id}/teams/dashboard/settings`
    : `/organization/${data.id}/dashboard/settings`

  revalidatePath(path)
}
