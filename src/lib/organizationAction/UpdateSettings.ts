import { db } from "@/db/drizzle"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { OrgData } from "@/lib/types/organization"

export async function updateSettings(
  data: Partial<OrgData> & { id: string },
  opts?: { team?: boolean }
): Promise<void> {
  console.log("data", data)
  const updateData: Record<string, any> = {
    ...(data.name && { name: data.name.trim() }),
    ...(data.websiteUrl && {
      websiteUrl: data.websiteUrl.trim().replace(/^https?:\/\//, ""),
    }),
    ...(data.description !== undefined && {
      description:
        typeof data.description === "string" ? data.description.trim() : "",
    }),
    ...(data.openGraphUrl !== undefined && {
      openGraphUrl: data.openGraphUrl || null,
    }),
    ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl || null }),
    ...(data.referralParam && { referralParam: data.referralParam }),
    ...(data.cookieLifetimeValue && {
      cookieLifetimeValue: Math.round(Number(data.cookieLifetimeValue)),
    }),
    ...(data.cookieLifetimeUnit && {
      cookieLifetimeUnit: data.cookieLifetimeUnit,
    }),
    ...(data.commissionType && { commissionType: data.commissionType }),
    ...(data.commissionValue && {
      commissionValue: Number(Number(data.commissionValue).toFixed(2)),
    }),
    ...(data.commissionDurationValue && {
      commissionDurationValue: Math.round(Number(data.commissionDurationValue)),
    }),
    ...(data.commissionDurationUnit && {
      commissionDurationUnit: data.commissionDurationUnit,
    }),
    ...(data.currency && { currency: data.currency }),
    ...(data.attributionModel && { attributionModel: data.attributionModel }),
  }
  // ✅ Only update org if there are changes
  if (Object.keys(updateData).length > 0) {
    await db
      .update(organization)
      .set(updateData)
      .where(eq(organization.id, data.id))
  }

  if (opts?.team) {
    revalidatePath(`/organization/${data.id}/teams/dashboard/settings`)
  } else {
    revalidatePath(`/organization/${data.id}/dashboard/settings`)
  }
}
