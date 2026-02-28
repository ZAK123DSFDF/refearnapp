import nodemailer from "nodemailer"
import { SendMailClient } from "zeptomail"
import { Resend } from "resend"

type SendEmailInput = {
  to: string
  subject: string
  html: string
  replyTo?: string
  fromName?: string
  fromEmail?: string
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const sendEmail = async ({
  to,
  subject,
  html,
  replyTo,
  fromName: manualName,
  fromEmail: manualEmail,
}: SendEmailInput) => {
  // 1. Helper to clean URLs into hostnames
  const extractDomain = (input?: string) => {
    if (!input) return null
    try {
      if (input.includes("://")) {
        return new URL(input).hostname
      }
      return input.split("/")[0].trim()
    } catch {
      return null
    }
  }

  // 2. Resolve the final FROM NAME
  const finalFromName =
    manualName || process.env.EMAIL_FROM_NAME || "RefearnApp"

  // 3. Resolve the final FROM EMAIL (Robust extraction)
  const emailDomain = extractDomain(process.env.EMAIL_DOMAIN)
  const baseDomain =
    extractDomain(process.env.NEXT_PUBLIC_BASE_URL) || "refearnapp.com"

  const finalFromEmail =
    manualEmail ||
    process.env.EMAIL_FROM_ADDRESS ||
    `noreply@${emailDomain || baseDomain}`

  const provider = process.env.EMAIL_PROVIDER

  // --- 1. RESEND ---
  if (provider === "resend" && resend) {
    return await resend.emails.send({
      from: `${finalFromName} <${finalFromEmail}>`,
      to: [to],
      subject,
      html,
      replyTo,
    })
  }

  // --- 2. SMTP ---
  if (provider === "smtp") {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
    return transporter.sendMail({
      from: `"${finalFromName}" <${finalFromEmail}>`,
      to,
      subject,
      html,
      replyTo,
    })
  }

  // --- 3. DEVELOPMENT ---
  if (process.env.NODE_ENV === "development") {
    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
    })
    return transporter.sendMail({
      from: `"${finalFromName}" <${finalFromEmail}>`,
      to,
      subject,
      html,
      replyTo,
    })
  }

  // --- 4. ZEPTOMAIL (Cleaned up to use finalFromEmail) ---
  const client = new SendMailClient({
    url: "https://api.zeptomail.com/v1.1/email",
    token: process.env.ZEPTO_TOKEN!,
  })

  return client.sendMail({
    from: {
      address: finalFromEmail,
      name: finalFromName,
    },
    to: [
      {
        email_address: {
          address: to,
        },
      },
    ],
    subject,
    htmlbody: html,

    ...(replyTo
      ? {
          reply_to: [
            {
              address: replyTo,
            },
          ],
        }
      : {}),
  })
}
