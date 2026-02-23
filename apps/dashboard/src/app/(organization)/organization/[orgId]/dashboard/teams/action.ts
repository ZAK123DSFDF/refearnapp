"use server"

import { db } from "@/db/drizzle"
import { invitation, team } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { handleAction } from "@/lib/handleAction"
import { MutationData } from "@/lib/types/organization/response"
import { getUserPlan } from "@/lib/server/organization/getUserPlan"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { sendVerificationEmail } from "@/lib/verificationEmail"
import { AppError } from "@/lib/exceptions"

export const inviteTeamMember = async ({
  email,
  title,
  description,
  orgId,
}: {
  email: string
  title: string
  description: string
  orgId: string
}) => {
  return handleAction("Invite Team Member", async () => {
    await getOrgAuth(orgId)
    if (!email || !title || !description || !orgId) {
      throw new AppError({
        status: 400,
        error: "Missing required fields.",
        toast: "Please fill in all required fields.",
        fields: {
          email: !email ? "Email is required" : "",
          title: !title ? "Title is required" : "",
          description: !description ? "Description is required" : "",
          orgId: !orgId ? "Organization is required" : "",
        },
      })
    }
    const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
    const plan = await getUserPlan()

    // 🟢 Enforce plan-based restrictions (Skip if Self-Hosted)
    if (!isSelfHosted) {
      const teamCount = await db.query.team.findMany({
        where: eq(team.organizationId, orgId),
      })

      if (plan.plan === "FREE") {
        throw new AppError({
          status: 403,
          toast: "Free plan users cannot invite team members.",
        })
      }

      if (plan.plan === "PRO" && teamCount.length >= 3) {
        throw new AppError({
          status: 403,
          toast: "Pro plan allows up to 3 team members. Upgrade for more.",
        })
      }
    }
    // Check if this email is already invited
    const existingTeamMember = await db.query.team.findFirst({
      where: and(eq(team.email, email), eq(team.organizationId, orgId)),
    })

    if (existingTeamMember) {
      throw new AppError({
        status: 409,
        error: "This email is already a team member.",
        toast: "This user is already part of your team.",
        fields: { email: "Already a team member" },
      })
    }
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const [invite] = await db
      .insert(invitation)
      .values({
        email,
        organizationId: orgId,
        title,
        body: description,
        expiresAt,
      })
      .returning()
    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${orgId}/teams/signup?teamToken=${invite.token}`
    await sendVerificationEmail(email, inviteLink, "team-invite", undefined, {
      title,
      description,
    })
    return {
      ok: true,
      toast: "Invitation sent successfully.",
    }
  })
}
export async function toggleTeamStatus({
  id,
  active,
  orgId,
}: {
  id: string
  active: boolean
  orgId: string
}): Promise<MutationData> {
  return handleAction("toggleTeamStatus", async () => {
    await getOrgAuth(orgId)
    // 🟢 Enforce plan-based restrictions
    const plan = await getUserPlan()

    if (plan.plan === "FREE") {
      throw new AppError({
        status: 403,
        toast: "Free plan users cannot toggle team status",
      })
    }
    await db
      .update(team)
      .set({ isActive: active })
      .where(and(eq(team.id, id), eq(team.organizationId, orgId)))
    return {
      ok: true,
      toast: `Team member ${active ? "activated" : "deactivated"} successfully.`,
    }
  })
}
export async function deleteTeamMember({
  id,
  orgId,
}: {
  id: string
  orgId: string
}): Promise<MutationData> {
  return handleAction("deleteTeamMember", async () => {
    await getOrgAuth(orgId)
    // 🟢 Enforce plan-based restrictions
    const plan = await getUserPlan()

    if (plan.plan === "FREE") {
      throw new AppError({
        status: 403,
        toast: "Free plan users cannot delete teams.",
      })
    }
    await db
      .delete(team)
      .where(and(eq(team.id, id), eq(team.organizationId, orgId)))
    return {
      ok: true,
      toast: "Team member deleted successfully.",
    }
  })
}
