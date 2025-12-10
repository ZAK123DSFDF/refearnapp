import { organization, websiteDomain } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { OrgData } from "@/lib/types/organization"
import { getDB } from "@/db/drizzle"

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
  const db = await getDB()
  // ✅ Handle domain update
  if (data.defaultDomain) {
    const normalizedDomain = data.defaultDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")

    // Get currently active domain of the org
    const [activeDomain] = await db
      .select()
      .from(websiteDomain)
      .where(
        and(
          eq(websiteDomain.orgId, data.id),
          eq(websiteDomain.isActive, true),
          eq(websiteDomain.isRedirect, false)
        )
      )

    // Check if the new domain already exists in DB
    const [existingDomain] = await db
      .select()
      .from(websiteDomain)
      .where(eq(websiteDomain.domainName, normalizedDomain))

    if (existingDomain) {
      if (existingDomain.orgId === data.id) {
        // 🟢 Case 1: Belongs to current org — re-activate it
        await db
          .update(websiteDomain)
          .set({
            isActive: true,
            isRedirect: false,
            updatedAt: new Date(),
          })
          .where(eq(websiteDomain.id, existingDomain.id))

        // Mark previous domain as redirect (if exists and different)
        if (activeDomain && activeDomain.id !== existingDomain.id) {
          await db
            .update(websiteDomain)
            .set({
              isActive: false,
              isRedirect: true,
              updatedAt: new Date(),
            })
            .where(eq(websiteDomain.id, activeDomain.id))
        }
      } else {
        // 🔴 Case 3: Belongs to another org
        throw {
          status: 400,
          error: "Domain already exists in another organization",
          toast:
            "This domain is already linked to another organization. Please use a different domain.",
          data: existingDomain.domainName,
        }
      }
    } else {
      // 🟡 Case 2: New domain — insert
      if (activeDomain) {
        await db
          .update(websiteDomain)
          .set({
            isActive: false,
            isRedirect: true,
            updatedAt: new Date(),
          })
          .where(eq(websiteDomain.id, activeDomain.id))
      }

      await db.insert(websiteDomain).values({
        orgId: data.id,
        domainName: normalizedDomain,
        isActive: true,
        isRedirect: false,
        type: normalizedDomain.endsWith(".refearnapp.com")
          ? "DEFAULT"
          : "CUSTOM",
      })
    }
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
