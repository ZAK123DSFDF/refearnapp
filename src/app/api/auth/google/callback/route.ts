// app/api/auth/google/callback/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { db } from "@/db/drizzle"
import {
  user,
  account,
  affiliate,
  affiliateAccount,
  teamAccount,
  team,
} from "@/db/schema"
import { buildAffiliateUrl } from "@/util/Url"
import { assignFreeTrialSubscription } from "@/lib/server/assignFreeTrial"
import { assignLifetimePurchase } from "@/lib/server/assignLifetimePurchase"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions" // Assuming you have this for custom errors

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`

export const GET = handleRoute("Google OAuth Callback", async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const stateRaw = url.searchParams.get("state") || ""
  const state = JSON.parse(decodeURIComponent(stateRaw || "{}"))

  const txnId = state.txn
  const baseUrl = state.baseUrl || process.env.NEXT_PUBLIC_BASE_URL
  const page = state.page || "login"
  const rememberMe = !!state.rememberMe
  const type = (state.type || "organization") as
    | "organization"
    | "affiliate"
    | "team"
  const orgIdFromState = state.orgId as string | undefined

  if (!code)
    throw new AppError({ error: "Missing code from Google", status: 400 })

  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  const { tokens } = await client.getToken(code)
  if (!tokens.id_token)
    throw new AppError({ error: "No id_token from Google", status: 400 })

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: CLIENT_ID,
  })
  const payload = ticket.getPayload()
  if (!payload)
    throw new AppError({ error: "Invalid Google token payload", status: 400 })

  const googleSub = payload.sub!
  const email = payload.email!
  const name = payload.name ?? ""

  // ---------- TEAM flow ----------
  if (type === "team") {
    let teamAcc = await db.query.teamAccount.findFirst({
      where: (aa, { and, eq }) =>
        and(eq(aa.provider, "google"), eq(aa.providerAccountId, googleSub)),
    })

    let appUser: any = null
    if (teamAcc) {
      appUser = await db.query.team.findFirst({
        where: (t, { eq }) => eq(t.id, teamAcc!.teamId),
      })
    } else {
      const existingTeamByEmail = await db.query.team.findFirst({
        where: (t, { eq }) => eq(t.email, email),
      })
      if (existingTeamByEmail) {
        await db.insert(teamAccount).values({
          teamId: existingTeamByEmail.id,
          provider: "google",
          providerAccountId: googleSub,
          emailVerified: new Date(),
        })
        appUser = existingTeamByEmail
      } else {
        const [createdTeam] = await db
          .insert(team)
          .values({
            name,
            email,
            organizationId: orgIdFromState!,
            type: "ORGANIZATION",
            role: "TEAM",
          })
          .returning()
        appUser = createdTeam
        await db.insert(teamAccount).values({
          teamId: createdTeam.id,
          provider: "google",
          providerAccountId: googleSub,
          emailVerified: new Date(),
        })
      }
    }

    const sessionPayload = {
      id: appUser.id,
      email: appUser.email,
      type: "ORGANIZATION",
      role: "TEAM",
      orgId: orgIdFromState,
    }
    const token = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
      expiresIn: rememberMe ? "30d" : "1d",
    })

    const cookieStore = await cookies()
    cookieStore.set({
      name: `teamToken-${orgIdFromState}`,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined,
      path: "/",
    })
    return NextResponse.redirect(
      new URL(
        `/organization/${orgIdFromState}/teams/dashboard/analytics`,
        process.env.NEXT_PUBLIC_BASE_URL
      )
    )
  }

  // ---------- ORGANIZATION flow ----------
  if (type === "organization") {
    let linkedAccount = await db.query.account.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.provider, "google"), eq(a.providerAccountId, googleSub)),
    })

    let appUser: any = null
    if (linkedAccount) {
      appUser = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, linkedAccount!.userId),
      })
    } else {
      const existingUserByEmail = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      })
      if (existingUserByEmail) {
        await db.insert(account).values({
          userId: existingUserByEmail.id,
          provider: "google",
          providerAccountId: googleSub,
          emailVerified: new Date(),
        })
        appUser = existingUserByEmail
        if (txnId) await assignLifetimePurchase(existingUserByEmail.id, txnId)
      } else {
        const [createdUser] = await db
          .insert(user)
          .values({ name, email, type: "ORGANIZATION", role: "OWNER" })
          .returning()
        appUser = createdUser
        await db.insert(account).values({
          userId: createdUser.id,
          provider: "google",
          providerAccountId: googleSub,
          emailVerified: new Date(),
        })
        if (txnId) {
          await assignLifetimePurchase(appUser.id, txnId)
        } else {
          await assignFreeTrialSubscription(appUser.id)
        }
      }
    }

    const orgs = await db.query.organization.findMany({
      where: (org, { eq }) => eq(org.userId, appUser.id),
    })
    const orgIds = orgs.map((o) => o.id)
    const activeOrgId = orgIds[0] ?? undefined

    const token = jwt.sign(
      {
        id: appUser.id,
        email: appUser.email,
        type: appUser.type,
        role: appUser.role,
        orgIds,
        activeOrgId,
      },
      process.env.SECRET_KEY!,
      { expiresIn: rememberMe ? "30d" : "1d" }
    )

    const cookieStore = await cookies()
    cookieStore.set({
      name: "organizationToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined,
      path: "/",
    })

    const targetPath =
      orgIds.length === 0
        ? "/create-company"
        : `/organization/${activeOrgId}/dashboard/analytics`
    return NextResponse.redirect(
      new URL(targetPath, process.env.NEXT_PUBLIC_BASE_URL)
    )
  }

  // ---------- AFFILIATE flow ----------
  if (type === "affiliate") {
    const orgId = orgIdFromState
    if (!orgId)
      throw new AppError({
        error: "Missing orgId for affiliate login",
        status: 400,
      })

    let linkedAffAcc = await db.query.affiliateAccount.findFirst({
      where: (aa, { and, eq }) =>
        and(eq(aa.provider, "google"), eq(aa.providerAccountId, googleSub)),
    })

    let aff: any
    if (linkedAffAcc) {
      aff = await db.query.affiliate.findFirst({
        where: (a, { eq }) => eq(a.id, linkedAffAcc!.affiliateId),
      })
    } else {
      const byEmail = await db.query.affiliate.findFirst({
        where: (a, { and, eq }) =>
          and(eq(a.email, email), eq(a.organizationId, orgId)),
      })
      if (byEmail) {
        await db.insert(affiliateAccount).values({
          affiliateId: byEmail.id,
          provider: "google",
          providerAccountId: googleSub,
          emailVerified: new Date(),
        })
        aff = byEmail
      } else {
        const [createdAff] = await db
          .insert(affiliate)
          .values({ name, email, organizationId: orgId, type: "AFFILIATE" })
          .returning()
        aff = createdAff
        await db.insert(affiliateAccount).values({
          affiliateId: createdAff.id,
          provider: "google",
          providerAccountId: googleSub,
          emailVerified: new Date(),
        })
      }
    }

    const token = jwt.sign(
      { id: aff.id, email: aff.email, type: "AFFILIATE", orgId },
      process.env.SECRET_KEY!,
      { expiresIn: rememberMe ? "30d" : "1d" }
    )
    const redirectUrl = buildAffiliateUrl({
      path: page === "login" ? "verify-login" : "verify-signup",
      organizationId: orgId,
      token,
      baseUrl,
      partial: true,
    })

    return NextResponse.redirect(new URL(redirectUrl, baseUrl))
  }

  return NextResponse.redirect(new URL("/login", baseUrl))
})
