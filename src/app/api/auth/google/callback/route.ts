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

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const stateRaw = url.searchParams.get("state") || ""
    const state = JSON.parse(decodeURIComponent(stateRaw || "{}"))
    const txnId = state.txn
    if (!code) throw new Error("Missing code from Google")

    const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
    const { tokens } = await client.getToken(code)
    if (!tokens.id_token) throw new Error("No id_token from Google")

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload) throw new Error("Invalid Google token payload")

    const googleSub = payload.sub!
    const email = payload.email!
    const name = payload.name ?? ""
    const rememberMe = !!state.rememberMe
    const type = (state.type || "organization") as
      | "organization"
      | "affiliate"
      | "team"
    const orgIdFromState = state.orgId as string | undefined
    const baseUrl = state.baseUrl || process.env.NEXT_PUBLIC_BASE_URL
    const page = state.page || "login"
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
          const sessionPayload = {
            id: appUser.id,
            email: appUser.email,
            type: "ORGANIZATION",
            role: "TEAM",
            orgId: orgIdFromState, // affiliate's active org
          }
          const expiresIn = rememberMe ? "30d" : "1d"
          const token = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
            expiresIn,
          })

          // Store cookie
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
      }
    }
    // ---------- ORGANIZATION flow ----------
    if (type === "organization") {
      // Try to find an existing OAuth account by providerAccountId
      let linkedAccount = await db.query.account.findFirst({
        where: (a, { and, eq }) =>
          and(eq(a.provider, "google"), eq(a.providerAccountId, googleSub)),
      })

      let appUser: any = null

      if (linkedAccount) {
        // linkedAccount.userId -> fetch user
        appUser = await db.query.user.findFirst({
          where: (u, { eq }) => eq(u.id, linkedAccount!.userId),
        })
      } else {
        const existingUserByEmail = await db.query.user.findFirst({
          where: (u, { eq }) => eq(u.email, email),
        })

        if (existingUserByEmail) {
          // link google provider to this existing user
          await db.insert(account).values({
            userId: existingUserByEmail.id,
            provider: "google",
            providerAccountId: googleSub,
            emailVerified: new Date(),
          })
          appUser = existingUserByEmail
        } else {
          // create user + provider account
          const [createdUser] = await db
            .insert(user)
            .values({
              name,
              email,
              type: "ORGANIZATION",
              role: "OWNER",
            })
            .returning()
          appUser = createdUser
          await db.insert(account).values({
            userId: createdUser.id,
            provider: "google",
            providerAccountId: googleSub,
            emailVerified: new Date(),
          })
        }
      }
      if (txnId && appUser) {
        await assignLifetimePurchase(appUser.id, txnId)
      } else if (!linkedAccount && !appUser) {
        await assignFreeTrialSubscription(appUser.id)
      }
      // Now gather orgIds for the user (like your other login flow)
      const orgs = await db.query.organization.findMany({
        where: (org, { eq }) => eq(org.userId, appUser.id),
      })
      const orgIds = orgs.map((o) => o.id)
      const activeOrgId = orgIds[0] ?? undefined

      // create session payload & cookie (same naming you use elsewhere)
      const sessionPayload = {
        id: appUser.id,
        email: appUser.email,
        type: appUser.type,
        role: appUser.role,
        orgIds,
        activeOrgId,
      }

      const expiresIn = rememberMe ? "30d" : "1d"
      const token = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
        expiresIn,
      })

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

      // redirect to dashboard
      if (orgIds.length === 0) {
        // No organizations → signup → redirect to create-company
        return NextResponse.redirect(
          new URL("/create-company", process.env.NEXT_PUBLIC_BASE_URL)
        )
      } else {
        // Existing orgs → login → redirect to dashboard
        return NextResponse.redirect(
          new URL(
            `/organization/${activeOrgId}/dashboard/analytics`,
            process.env.NEXT_PUBLIC_BASE_URL
          )
        )
      }
    }

    // ---------- AFFILIATE flow ----------
    // affiliate flow requires orgId (state must contain orgId)
    if (type === "affiliate") {
      const orgId = orgIdFromState
      if (!orgId) throw new Error("Missing orgId for affiliate login")

      // find affiliate by linked provider
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
          // link provider account
          await db.insert(affiliateAccount).values({
            affiliateId: byEmail.id,
            provider: "google",
            providerAccountId: googleSub,
            emailVerified: new Date(),
          })
          aff = byEmail
        } else {
          // If you want to auto-create affiliates: create affiliate and account
          const [createdAff] = await db
            .insert(affiliate)
            .values({
              name,
              email,
              organizationId: orgId,
              type: "AFFILIATE",
            })
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

      // build session payload for affiliate
      const sessionPayload = {
        id: aff.id,
        email: aff.email,
        type: "AFFILIATE",
        orgId, // affiliate's active org
      }

      const expiresIn = state.rememberMe ? "30d" : "1d"
      const token = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
        expiresIn,
      })

      const redirectUrl = buildAffiliateUrl({
        path: page === "login" ? "verify-login" : "verify-signup",
        organizationId: orgId,
        token,
        baseUrl,
        partial: true,
      })
      return NextResponse.redirect(new URL(redirectUrl, baseUrl))
    }

    // fallback
    return NextResponse.redirect(new URL("/login", baseUrl))
  } catch (err) {
    console.error("Google callback error:", err)
    // show error page or redirect somewhere
    return NextResponse.redirect(
      new URL("/auth/error", process.env.NEXT_PUBLIC_BASE_URL)
    )
  }
}
