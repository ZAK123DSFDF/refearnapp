import nodemailer from "nodemailer"

export type EmailType = "login" | "signup" | "email-change" | "reset-password"

// Centralized config (no repetition)
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
} as const

// Reusable email template
function buildEmailTemplate(heading: string, button: string, link: string) {
  return `
    <div style="font-family:Arial, sans-serif; max-width:600px; padding:20px;">
      <h2 style="color:#333;">${heading}</h2>
      <p>Please click the button below:</p>

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

      <p>If the button doesn't work, click the link below:</p>
      <p><a href="${link}" style="color:#1a73e8;">${link}</a></p>

      <hr style="margin-top:32px;" />

      <p style="font-size:12px; color:#777;">
        If you didn’t request this, you can safely ignore this email.
      </p>
    </div>
  `
}

export const sendVerificationEmail = async (
  to: string,
  link: string,
  type: EmailType
) => {
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025, // MailDev or similar
    secure: false,
  })

  const content = EMAIL_CONTENT[type]

  await transporter.sendMail({
    from: '"Your App" <noreply@refearnapp.com>',
    to,
    subject: content.subject,
    html: buildEmailTemplate(content.heading, content.button, link),
  })
}
