"use server"

import { cookies } from "next/headers"
import {
  organization,
  organizationAuthCustomization,
  organizationDashboardCustomization,
  websiteDomain,
} from "@/db/schema"
import { CompanyFormValues } from "@/lib/schema/companySchema"
import jwt from "jsonwebtoken"
import { defaultAuthCustomization } from "@/customization/Auth/defaultAuthCustomization"
import { defaultDashboardCustomization } from "@/customization/Dashboard/defaultDashboardCustomization"
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { eq } from "drizzle-orm"
import { sanitizeDomain } from "@/util/SanitizeDomain"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
import { getUserPlan } from "@/lib/server/getUserPlan"
import { getDB } from "@/db/drizzle"

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const CreateOrganization = async (
  input: CompanyFormValues & { mode: "create" | "add" }
): Promise<MutationData> => {
  return handleAction("Organization Create", async () => {
    const db = await getDB()
    const cookieStore = await cookies()
    const token = cookieStore.get("organizationToken")?.value
    if (!token) throw { status: 401, error: "Unauthorized" }

    const decoded = jwt.decode(token) as {
      id: string
      email: string
      role: string
      type: string
      exp: number
      iat: number
      orgIds?: string[]
    }
    if (input.mode === "add") {
      const plan = await getUserPlan()
      const orgCount = await db.query.organization.findMany({
        where: eq(organization.userId, decoded.id),
      })

      if (plan.plan === "FREE" && orgCount.length >= 1) {
        throw {
          status: 403,
          toast:
            "Free plan allows only one organization. Upgrade to Pro or Ultimate.",
        }
      }

      if (plan.plan === "PRO" && orgCount.length >= 1) {
        throw {
          status: 403,
          toast:
            "Pro plan allows only one organization. Upgrade to Ultimate for more.",
        }
      }
    }

    const sanitizedWebsiteName = sanitizeDomain(input.websiteUrl)
    const normalizedDomain = input.defaultDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")

    // 🔍 Check if domain already exists in DB
    const existingDomain = await db.query.websiteDomain.findFirst({
      where: eq(websiteDomain.domainName, normalizedDomain),
    })
    if (existingDomain) {
      throw {
        status: 409,
        toast: `Domain name "${normalizedDomain}" already exists. Please choose another one.`,
        data: existingDomain.domainName,
      }
    }
    const [newOrg] = await db
      .insert(organization)
      .values({
        ...input,
        websiteUrl: sanitizedWebsiteName,
        commissionValue: input.commissionValue.toFixed(2),
        userId: decoded.id,
        logoUrl: input.logoUrl || null,
      })
      .returning()

    if (!newOrg) throw { status: 500, toast: "Failed to create org" }

    await db.insert(websiteDomain).values({
      orgId: newOrg.id,
      domainName: normalizedDomain,
      type: "DEFAULT",
      isActive: true,
      isRedirect: false,
    })

    await Promise.all([
      db
        .insert(organizationAuthCustomization)
        .values({ id: newOrg.id, auth: defaultAuthCustomization })
        .onConflictDoUpdate({
          target: organizationAuthCustomization.id,
          set: { auth: defaultAuthCustomization },
        }),

      db
        .insert(organizationDashboardCustomization)
        .values({ id: newOrg.id, dashboard: defaultDashboardCustomization })
        .onConflictDoUpdate({
          target: organizationDashboardCustomization.id,
          set: { dashboard: defaultDashboardCustomization },
        }),
    ])
    // 🟢 Decide how to build new orgIds array
    let orgIds: string[]
    if (input.mode === "create") {
      orgIds = [newOrg.id]
    } else {
      orgIds = [...(decoded.orgIds || []), newOrg.id]
    }

    // Active org is the one just created
    const newPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
      orgIds,
      activeOrgId: newOrg.id,
    }

    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000)
    const newToken = jwt.sign(newPayload, process.env.SECRET_KEY!, {
      expiresIn,
    })

    cookieStore.set("organizationToken", newToken, { httpOnly: true })
    return {
      ok: true,
      toast: "Company created successfully!",
      data: { id: newOrg.id },
    }
  })
}
export async function deleteOrganizationLogo(
  logoUrl: string
): Promise<MutationData> {
  return handleAction("Delete Organization Logo", async () => {
    if (!logoUrl) throw { status: 500, toast: "logo not found" }

    // 1. Extract the object key from R2 public URL
    const uploadPath = logoUrl.replace(`${process.env.R2_ACCESS_URL}/`, "")

    // 2. Delete from R2
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uploadPath,
      })
    )

    return { ok: true, toast: "Deleted Successfully" }
  })
}
export async function updateOrganizationLogo({
  orgId,
  field,
  value,
}: {
  orgId: string
  field: "logoUrl" | "openGraphUrl"
  value: string | null
}): Promise<MutationData> {
  return handleAction("Update Organization Logo", async () => {
    if (!orgId) throw { status: 500, toast: "missing orgId" }
    const db = await getDB()
    await db
      .update(organization)
      .set({ [field]: value })
      .where(eq(organization.id, orgId))

    return { ok: true, toast: "Logo Updated Successfully" }
  })
}
