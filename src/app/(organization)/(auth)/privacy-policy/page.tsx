// components/Legal/PrivacyPolicy.tsx
import React from "react"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Privacy Policy Page",
  description: "Privacy Policy Page",
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
        At RefearnApp, we respect your privacy and are committed to protecting
        your personal information. This Privacy Policy explains how we collect,
        use, disclose, and safeguard your information when you use our
        software-as-a-service (SaaS) platform.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        1. Information We Collect
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          Personal identification information (name, email, company name).
        </li>
        <li>
          Account credentials, subscription details, and payment information.
        </li>
        <li>
          Usage data including analytics, feature interactions, and log data.
        </li>
        <li>Cookies and tracking technologies to improve user experience.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>To provide and maintain our SaaS services effectively.</li>
        <li>To process payments and manage subscriptions securely.</li>
        <li>To improve and personalize user experience on our platform.</li>
        <li>
          To communicate important updates, notifications, and support messages.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        3. Sharing Your Information
      </h2>
      <p className="mb-4">
        We do not sell your personal information. We may share your data in the
        following circumstances:
      </p>
      <ul className="list-disc list-inside space-y-2">
        <li>With service providers who assist in delivering our services.</li>
        <li>When required by law or to protect our rights and safety.</li>
        <li>
          In connection with business transfers, such as mergers or
          acquisitions.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
      <p className="mb-4">
        We implement reasonable administrative, technical, and physical
        safeguards to protect your personal information. However, no method of
        transmission over the internet or electronic storage is 100% secure, and
        we cannot guarantee absolute security.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        5. Your Privacy Choices
      </h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          You can update your account information at any time through our
          platform.
        </li>
        <li>
          You may opt-out of promotional emails by following the unsubscribe
          instructions.
        </li>
        <li>
          You can request access to, correction, or deletion of your personal
          information by contacting us.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        6. Cookies and Tracking
      </h2>
      <p className="mb-4">
        We use cookies and similar technologies to improve website
        functionality, track usage patterns, and personalize content. You can
        control cookies through your browser settings.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        7. Changes to This Privacy Policy
      </h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Changes will be
        posted on this page with the updated effective date. We encourage you to
        review this policy periodically.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
      <p className="mb-4">
        If you have questions about this Privacy Policy or our data practices,
        please contact us at <strong>support@refearnapp.com</strong>.
      </p>

      <p className="text-sm mt-12">
        &copy; {currentYear} RefearnApp. All rights reserved.
      </p>
    </div>
  )
}

export default PrivacyPolicy
