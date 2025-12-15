import React from "react"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"

export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Terms of Service",
  description: "Terms of Service for RefearnApp",
  url: "https://refearnapp.com/terms",
  indexable: true,
})

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-12">
        Last Updated: {new Date().toLocaleDateString()}
      </p>

      <section className="space-y-6 text-foreground">
        <p>
          Welcome to <strong>RefearnApp</strong> (“RefearnApp”, “Company”, “we”,
          “our”, or “us”). These Terms of Service (“Terms”) govern your access
          to and use of our website, products, and services (collectively, the
          “Service”). By accessing or using the Service, you agree to be bound
          by these Terms.
        </p>

        <h2 className="text-xl font-semibold">1. Eligibility</h2>
        <p>
          You must be at least 18 years old and legally capable of entering into
          a binding agreement to use the Service.
        </p>

        <h2 className="text-xl font-semibold">2. Account Registration</h2>
        <p>
          You agree to provide accurate and complete information, keep your
          account credentials secure, and accept responsibility for all activity
          that occurs under your account.
        </p>

        <h2 className="text-xl font-semibold">3. Use of the Service</h2>
        <p>
          You agree not to misuse the Service, interfere with its operation,
          attempt to reverse engineer any part of it, or use it for unlawful or
          unauthorized purposes.
        </p>

        <h2 className="text-xl font-semibold">
          4. Subscriptions, Billing & Payments
        </h2>
        <p>
          Paid features and subscriptions are processed by{" "}
          <strong>Polar.sh</strong>, which acts as our{" "}
          <strong>Merchant of Record</strong>. By making a purchase, you agree
          to Polar’s applicable terms and policies in addition to these Terms.
        </p>

        <h3 className="text-lg font-medium">4.1 Payments</h3>
        <p>
          All payments, taxes, invoicing, and payment processing are securely
          handled by Polar on behalf of RefearnApp.
        </p>

        <h3 className="text-lg font-medium">4.2 Billing & Renewals</h3>
        <p>
          Subscriptions renew automatically at the end of each billing period
          unless cancelled before renewal. Failed or overdue payments may result
          in temporary suspension or loss of access to the Service.
        </p>

        <h3 className="text-lg font-medium">4.3 Cancellation</h3>
        <p>
          You may cancel your subscription at any time. Upon cancellation,
          access to paid features will remain available until the end of the
          current billing period.
        </p>

        <h2 className="text-xl font-semibold">5. Refunds</h2>
        <p>
          Refunds are handled in accordance with Polar’s refund process and our
          published <strong>Refund Policy</strong>. Eligibility for refunds may
          depend on usage, subscription status, and applicable laws.
        </p>

        <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
        <p>
          All content, software, designs, logos, and materials provided through
          the Service are the exclusive property of RefearnApp or its licensors.
          You may not copy, distribute, or reuse any portion of the Service
          without prior written permission.
        </p>

        <h2 className="text-xl font-semibold">7. Third-Party Services</h2>
        <p>
          The Service may integrate with third-party services, including payment
          processors such as Polar. We are not responsible for the content,
          terms, or practices of third-party services.
        </p>

        <h2 className="text-xl font-semibold">8. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the
          Service if you violate these Terms, misuse the Service, or pose
          security or legal risks.
        </p>

        <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, RefearnApp shall not be liable
          for indirect, incidental, or consequential damages, including loss of
          data, revenue, or service availability.
        </p>

        <h2 className="text-xl font-semibold">10. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the
          Service after changes take effect constitutes acceptance of the
          updated Terms.
        </p>

        <h2 className="text-xl font-semibold">11. Contact</h2>
        <p>If you have questions about these Terms, please contact us at:</p>
        <p>
          <strong>support@refearnapp.com</strong>
        </p>
      </section>
    </div>
  )
}
