"use server"

import { user, account } from "@/db/schema"
import { db } from "@/db/drizzle"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "@/lib/mail"
import { customAlphabet } from "nanoid"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"

type CreateUserPayload = {
  name: string
  email: string
  password: string
}

// Generate 6-digit numeric ID for providerAccountId
const generateCredentialsAccountId = customAlphabet("0123456789", 6)

export const SignupServer = async ({
  name,
  email,
  password,
}: CreateUserPayload): Promise<MutationData> => {
  return handleAction("Signup Server", async () => {
    if (!email || !password || !name) {
      throw {
        status: 400,
        error: "Missing required fields.",
        toast: "Please fill in all required fields.",
        fields: {
          email: !email ? "Email is required" : "",
          password: !password ? "Password is required" : "",
          name: !name ? "Name is required" : "",
        },
      }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, normalizedEmail),
    })

    const hashedPassword = await bcrypt.hash(password, 10)

    if (existingUser) {
      // Check if credentials account already exists
      const existingAcc = await db.query.account.findFirst({
        where: (a, { and, eq }) =>
          and(eq(a.userId, existingUser.id), eq(a.provider, "credentials")),
      })

      if (existingAcc) {
        throw {
          status: 409,
          error: "User already exists.",
          toast: "This email is already registered",
          data: existingUser.email,
          fields: { email: "Email already in use" },
        }
      }

      // Create new credentials account for existing user
      await db.insert(account).values({
        userId: existingUser.id,
        provider: "credentials",
        providerAccountId: generateCredentialsAccountId(),
        password: hashedPassword,
      })

      const existingOrgs = await db.query.organization.findMany({
        where: (o, { eq }) => eq(o.userId, existingUser.id),
      })
      const orgIds = existingOrgs.map((o) => o.id)
      const token = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          type: existingUser.type,
          orgIds,
          activeOrgId: orgIds[0] || null,
        },
        process.env.SECRET_KEY as string,
        { expiresIn: "15m" }
      )

      const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-signup?organizationToken=${token}`
      await sendVerificationEmail(existingUser.email, verifyUrl, "signup")
      return {
        ok: true,
        toast: "Verification email sent",
        redirectUrl: `/checkEmail?email=${encodeURIComponent(existingUser.email)}`,
      }
    }

    // Create new user + credentials account
    const [newUser] = await db
      .insert(user)
      .values({
        name,
        email: normalizedEmail,
        type: "ORGANIZATION",
        role: "OWNER",
      })
      .returning()

    if (!newUser) {
      throw {
        status: 500,
        error: "User creation failed.",
        toast: "Something went wrong while creating user.",
      }
    }

    await db.insert(account).values({
      userId: newUser.id,
      provider: "credentials",
      providerAccountId: generateCredentialsAccountId(),
      password: hashedPassword,
    })

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        type: newUser.type,
      },
      process.env.SECRET_KEY as string,
      { expiresIn: "15m" }
    )

    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-signup?organizationToken=${token}`

    await sendVerificationEmail(newUser.email, verifyUrl, "signup")
    return {
      ok: true,
      toast: "Verification email sent",
      redirectUrl: `/checkEmail?email=${encodeURIComponent(newUser.email)}`,
    }
  })
}
