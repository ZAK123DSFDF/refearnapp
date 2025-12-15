// components/Legal/PrivacyPolicy.tsx
import React from "react"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"

export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Privacy Policy",
  description: "Privacy Policy for RefearnApp",
  url: "https://refearnapp.com/privacy-policy",
  indexable: true,
})

const PrivacyPolicy = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-foreground">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <p className="mb-4">Effective Date: {currentYear}-01-01</p>

      <p className="mb-6">
        RefearnApp (“RefearnApp”, “we”, “our”, or “us”) is committed to
        protecting your privacy. This Privacy Policy explains how we collect,
        use, disclose, and safeguard your information when you access or use our
        software-as-a-service (SaaS) platform.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        1. Information We Collect
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          Personal information such as name, email address, and company name.
        </li>
        <li>
          Account-related information including subscription status and plan
          details.
        </li>
        <li>
          Usage data such as feature interactions, log data, and analytics.
        </li>
        <li>
          Cookies and similar tracking technologies to enhance functionality and
          performance.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        2. Payments & Billing Information
      </h2>
      <p className="mb-4">
        Payments for paid services are processed by <strong>Polar.sh</strong>,
        which acts as our <strong>Merchant of Record</strong>. RefearnApp does
        not store or process your full payment card details. Payment information
        is handled securely by Polar in accordance with their privacy and
        security practices.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        3. How We Use Your Information
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>To provide, operate, and maintain the Service.</li>
        <li>To manage subscriptions, billing status, and account access.</li>
        <li>To improve, personalize, and optimize user experience.</li>
        <li>
          To communicate service-related notices, updates, and support messages.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        4. Sharing of Information
      </h2>
      <p className="mb-4">
        We do not sell your personal data. We may share information only in the
        following circumstances:
      </p>
      <ul className="list-disc list-inside space-y-2">
        <li>
          With trusted service providers (such as hosting, analytics, and
          payment processing providers like Polar).
        </li>
        <li>
          When required to comply with legal obligations or lawful requests.
        </li>
        <li>
          In connection with a business transaction such as a merger,
          acquisition, or asset sale.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
      <p className="mb-4">
        We apply reasonable technical and organizational measures to protect
        your information. However, no online system can be guaranteed to be
        completely secure, and we cannot ensure absolute security.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        6. Your Rights & Choices
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>You may update or correct your account information at any time.</li>
        <li>
          You may opt out of non-essential emails by using the unsubscribe link.
        </li>
        <li>
          You may request access to or deletion of your personal data by
          contacting us.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        7. Cookies & Tracking Technologies
      </h2>
      <p className="mb-4">
        We use cookies and similar technologies to analyze usage, remember
        preferences, and improve performance. You can control cookies through
        your browser settings.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        8. Changes to This Policy
      </h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Updates will be
        posted on this page with a revised effective date.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy or our data
        practices, please contact us at <strong>support@refearnapp.com</strong>.
      </p>

      <p className="text-sm mt-12">
        &copy; {currentYear} RefearnApp. All rights reserved.
      </p>
    </div>
  )
}

export default PrivacyPolicy
