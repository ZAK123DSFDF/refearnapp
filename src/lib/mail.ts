import nodemailer from "nodemailer"
import { SendMailClient } from "zeptomail"

export type EmailType =
  | "login"
  | "signup"
  | "email-change"
  | "reset-password"
  | "team-invite"

const EMAIL_CONTENT = {
  login: {
    subject: "Verify Your Login",
    heading: "Approve Login Request",
    button: "Verify Login",
  },
  signup: {
    subject: "Verify Your Email to Complete Signup",
    heading: "Verify Your Email",
    button: "Verify Email",
  },
  "email-change": {
    subject: "Confirm Your New Email Address",
    heading: "Confirm Your New Email",
    button: "Confirm Email Change",
  },
  "reset-password": {
    subject: "Reset Your Password",
    heading: "Reset Your Password",
    button: "Reset Password",
  },
  "team-invite": {
    subject: "You're Invited to Join a Team",
    heading: "Team Invitation",
    button: "Accept Invitation",
  },
} as const

function buildEmailTemplate(
  heading: string,
  description: string | null,
  button: string,
  link: string
) {
  return `
    <div style="font-family:Arial, sans-serif; max-width:600px; padding:20px;">
      <h2 style="color:#333;">${heading}</h2>

      ${description ? `<p style="color:#555; margin-bottom:12px;">${description}</p>` : ""}

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
        ${button}
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
  extra?: { title?: string; description?: string }
) => {
  const base = EMAIL_CONTENT[type]

  // If not team invite → use defaults (NO CHANGE)
  const subject =
    type === "team-invite" && extra?.title ? extra.title : base.subject

  const heading =
    type === "team-invite" && extra?.title ? extra.title : base.heading

  const description = type === "team-invite" ? (extra?.description ?? "") : null

  const html = buildEmailTemplate(heading, description, base.button, link)

  // 📌 DEV MODE → MailDev
  if (process.env.NODE_ENV === "development") {
    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
    })

    return transporter.sendMail({
      from: '"Your App" <noreply@refearnapp.com>',
      to,
      subject,
      html,
    })
  }
  // 📌 PROD MODE → ZOHO ZEPTOMAIL
  const client = new SendMailClient({
    url: "https://api.zeptomail.com/v1.1/email",
    token: process.env.ZEPTO_TOKEN!,
  })

  return client.sendMail({
    from: {
      address: "noreply@refearnapp.com",
      name: "RefearnApp",
    },
    to: [
      {
        email_address: { address: to },
      },
    ],
    subject,
    htmlbody: html,
  })
}
