// components/Legal/RefundPolicy.tsx
import React from "react"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"

export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Refund Policy",
  description: "Refund Policy for RefearnApp",
  url: "https://refearnapp.com/refund-policy",
  indexable: true,
})

const RefundPolicy = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-foreground">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>

      <p className="mb-6">Effective Date: {currentYear}-01-01</p>

      <p className="mb-6">
        This Refund Policy explains how refunds and subscription cancellations
        are handled for RefearnApp (“RefearnApp”, “we”, “our”, or “us”). By
        purchasing a subscription, you agree to the terms outlined below.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        1. Subscription Payments
      </h2>
      <p className="mb-4">
        All payments for RefearnApp subscriptions are processed by{" "}
        <strong>Polar.sh</strong>, which acts as our{" "}
        <strong>Merchant of Record</strong>. Polar is responsible for payment
        processing, tax handling, and refunds in accordance with applicable
        laws.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        2. Refund Eligibility
      </h2>
      <p className="mb-4">
        You may request a refund within <strong>14 days</strong> of your initial
        subscription purchase, provided the request complies with applicable
        consumer protection laws. Refund requests submitted after this period
        are generally not eligible for approval.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        3. How to Request a Refund
      </h2>
      <p className="mb-4">
        To request a refund, please contact us at{" "}
        <strong>support@refearnapp.com</strong> and include:
      </p>
      <ul className="list-disc list-inside space-y-2">
        <li>The email address associated with your account</li>
        <li>Your subscription or order details</li>
        <li>A brief explanation of the refund request</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Refund Processing</h2>
      <p className="mb-4">
        If your refund request is approved, the refund will be processed by{" "}
        <strong>Polar</strong> using the original payment method. Processing
        times vary depending on your bank or payment provider and typically take
        between 5 and 10 business days.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        5. Subscription Cancellation
      </h2>
      <p className="mb-4">
        You may cancel your subscription at any time through your account
        settings. Upon cancellation, your access will remain active until the
        end of the current billing period. Cancellation does not automatically
        entitle you to a refund outside the 14-day refund window.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        6. Non-Refundable Cases
      </h2>
      <p className="mb-4">
        Except where required by law, we do not provide refunds for partially
        used billing periods, unused features, plan downgrades, or renewals
        after the refund eligibility period has passed.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact</h2>
      <p className="mb-4">
        If you have questions about this Refund Policy or need assistance,
        please contact us at <strong>support@refearnapp.com</strong>.
      </p>

      <p className="text-sm mt-12">
        &copy; {currentYear} RefearnApp. All rights reserved.
      </p>
    </div>
  )
}

export default RefundPolicy
