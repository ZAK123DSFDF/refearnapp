import { db } from "@/db/drizzle"
import { sendEmail } from "@/lib/sendEmail"
import { escapeHtml } from "@/util/escapeHtml"
import { eq } from "drizzle-orm"
import { organization } from "@/db/schema"

export type EmailType =
  | "login"
  | "signup"
  | "email-change"
  | "reset-password"
  | "team-invite"
type EmailPayload = {
  subject: string
  heading: string
  button: string
  description?: string | null
}

type EmailContentResolver = (extra?: {
  title?: string
  description?: string
}) => EmailPayload
const EMAIL_CONTENT: Record<EmailType, EmailContentResolver> = {
  login: () => ({
    subject: "Verify Your Login",
    heading: "Approve Login Request",
    button: "Verify Login",
  }),

  signup: () => ({
    subject: "Verify Your Email to Complete Signup",
    heading: "Verify Your Email",
    button: "Verify Email",
  }),

  "email-change": () => ({
    subject: "Confirm Your New Email Address",
    heading: "Confirm Your New Email",
    button: "Confirm Email Change",
  }),

  "reset-password": () => ({
    subject: "Reset Your Password",
    heading: "Reset Your Password",
    button: "Reset Password",
  }),

  "team-invite": (extra) => ({
    subject: extra?.title ?? "You're Invited to Join a Team",
    heading: extra?.title ?? "Team Invitation",
    button: "Accept Invitation",
    description: extra?.description ?? null,
  }),
}
function buildEmailTemplate(
  heading: string,
  description: string | null,
  button: string,
  link: string
) {
  const safeHeading = escapeHtml(heading)
  const safeButton = escapeHtml(button)
  const safeDescription = description ? escapeHtml(description) : null

  return `
    <div style="font-family:Arial, sans-serif; max-width:600px; padding:20px;">
      <h2 style="color:#333;">${safeHeading}</h2>

      ${
        safeDescription
          ? `<p style="color:#555; margin-bottom:12px; white-space:pre-line;">
               ${safeDescription}
             </p>`
          : ""
      }

      <a href="${link}"
        style="
          display:inline-block;
          padding:12px 20px;
          background:#1a73e8;
          color:#fff;
          border-radius:6px;
          text-decoration:none;
          font-size:15px;
          margin:16px 0;
        "
      >
        ${safeButton}
      </a>

      <p>If the button doesn't work, use the link below:</p>
      <p><a href="${link}" style="color:#1a73e8;">${link}</a></p>
    </div>
  `
}

export const sendVerificationEmail = async (
  to: string,
  link: string,
  type: EmailType,
  orgId?: string,
  extra?: { title?: string; description?: string }
) => {
  const { subject, heading, button, description } = EMAIL_CONTENT[type](extra)
  const html = buildEmailTemplate(heading, description ?? null, button, link)
  let fromName = "RefearnApp"
  let replyTo = "support@refearnapp.com"
  if (orgId) {
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, orgId),
      columns: {
        name: true,
        supportEmail: true,
      },
    })

    if (org) {
      if (org.name) fromName = org.name
      if (org.supportEmail) replyTo = org.supportEmail
    }
  }
  return sendEmail({
    to,
    subject,
    fromName,
    html,
    replyTo,
  })
}
