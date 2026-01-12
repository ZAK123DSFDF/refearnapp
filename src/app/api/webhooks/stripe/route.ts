// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

import { db } from "@/db/drizzle"
import { affiliateInvoice } from "@/db/schema"
import { eq } from "drizzle-orm"
import { convertToUSD } from "@/util/CurrencyConvert"
import { getCurrencyDecimals } from "@/util/CurrencyDecimal"
import { safeFormatAmount } from "@/util/SafeParse"
import { invoicePaidUpdate } from "@/util/InvoicePaidUpdate"
import { getAffiliateLinkRecord } from "@/services/getAffiliateLinkRecord"
import { getOrganizationById } from "@/services/getOrganizationById"
import { handleSubscriptionExpiration } from "@/lib/server/handleSubscriptionExpiration"
import { checkSubscriptionExpired } from "@/util/CheckSubscriptionExpired"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  console.log("incoming webhook request")
  const sig = req.headers.get("stripe-signature")!
  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    console.log(`🔔 Webhook hit: ${event.type} for account ${event.account}`)
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed.", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}
      const refDataRaw = metadata.refearnapp_affiliate_code
      if (!refDataRaw) break

      const { code, commissionType, commissionValue } = JSON.parse(refDataRaw)
      const affiliateLinkRecord = await getAffiliateLinkRecord(code)
      if (!affiliateLinkRecord) break

      const organizationRecord = await getOrganizationById(
        affiliateLinkRecord.organizationId
      )
      if (!organizationRecord) break

      const mode = session.mode
      const isSubscription = mode === "subscription"
      const availableId =
        (session.customer as string) ?? (session.payment_intent as string)
      const subscriptionId = isSubscription
        ? (session.subscription as string)
        : null

      const rawAmount = safeFormatAmount(session.amount_total)
      const rawCurrency = session.currency ?? "usd"
      const decimals = getCurrencyDecimals(session.currency ?? "usd")

      const { amount } = await convertToUSD(
        parseFloat(rawAmount),
        rawCurrency,
        decimals
      )

      let commission = 0
      if (commissionType === "percentage") {
        commission = (parseFloat(amount) * parseFloat(commissionValue)) / 100
      } else if (commissionType === "fixed") {
        commission = parseFloat(commissionValue)
      }

      await db.insert(affiliateInvoice).values({
        paymentProvider: "stripe",
        subscriptionId,
        customerId: availableId,
        amount: amount.toString(),
        currency: "USD",
        rawAmount,
        rawCurrency,
        commission: commission.toString(),
        paidAmount: "0.00",
        unpaidAmount: commission.toFixed(2),
        affiliateLinkId: affiliateLinkRecord.id,
        reason: isSubscription ? "subscription_create" : "one_time",
      })
      console.log("✅ Created fresh invoice.")

      // 3. SEPARATE LOGIC FOR EXPIRATION (ONLY)
      if (subscriptionId) {
        const stripeAccountRecord =
          await db.query.organizationStripeAccount.findFirst({
            where: (table, { eq }) => eq(table.orgId, organizationRecord.id),
          })
        const stripeAccountId = stripeAccountRecord?.stripeAccountId
        const sub = await stripe.subscriptions.retrieve(subscriptionId, {
          stripeAccount: stripeAccountId,
        })
        let trialDays = 0
        if (sub.trial_end && sub.trial_start) {
          trialDays = Math.round((sub.trial_end - sub.trial_start) / 86400)
        }
        await handleSubscriptionExpiration(
          subscriptionId,
          organizationRecord,
          trialDays
        )
      }

      break
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice
      const invoiceCreatedDate = new Date(invoice.created * 1000)

      const subscriptionId = invoice.parent?.subscription_details
        ?.subscription as string
      const customerId = invoice.customer as string
      const reason = invoice.billing_reason

      if (reason === "subscription_update" || reason === "subscription_cycle") {
        // 1. Expiration Check
        if (subscriptionId) {
          const isExpired = await checkSubscriptionExpired(
            subscriptionId,
            invoiceCreatedDate
          )
          if (isExpired) {
            console.warn("❌ Subscription expired — skipping:", subscriptionId)
            break
          }
        }

        // 2. QUERY A: Find the historical record with valid data
        // We look for the specific subscriptionId and exclude the empty placeholders
        const historicalRecord = await db.query.affiliateInvoice.findFirst({
          where: (table, { eq, and, ne }) =>
            and(
              eq(table.subscriptionId, subscriptionId),
              eq(table.customerId, customerId),
              ne(table.reason, "placeholder_from_charge")
            ),
        })

        if (!historicalRecord || !historicalRecord.affiliateLinkId) {
          console.warn(
            "❌ No historical affiliate link found for sub:",
            subscriptionId
          )
          return NextResponse.json(
            { error: "No history found" },
            { status: 200 }
          )
        }

        // 3. QUERY B: Find the current placeholder created by the charge event
        const placeholder = await db.query.affiliateInvoice.findFirst({
          where: (table, { eq, and }) =>
            and(
              eq(table.customerId, customerId),
              eq(table.reason, "placeholder_from_charge")
            ),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        })

        // 4. Get Org Data using the Affiliate ID from the history
        const affiliateLinkRecord = await db.query.affiliateLink.findFirst({
          where: (link, { eq }) =>
            eq(link.id, historicalRecord.affiliateLinkId!),
        })

        if (!affiliateLinkRecord) break

        const organizationRecord = await getOrganizationById(
          affiliateLinkRecord.organizationId
        )
        if (!organizationRecord) break

        // 5. Final Calculations
        const total = String(invoice.total_excluding_tax ?? 0)
        const currency = invoice.currency
        const commissionType = organizationRecord.commissionType ?? "percentage"
        const commissionValue = organizationRecord.commissionValue ?? "0.00"

        // 6. CALL UTILITY
        // We update the placeholder (Query B) using the affiliate info (Query A)
        await invoicePaidUpdate(
          total,
          currency,
          customerId,
          subscriptionId || "",
          historicalRecord.affiliateLinkId,
          commissionType,
          commissionValue,
          placeholder?.id || null
        )

        console.log(
          `✅ Handled ${reason}. Mapped affiliate from ${historicalRecord.id} to placeholder ${placeholder?.id || "new"}`
        )
      }
      break
    }
    case "charge.succeeded": {
      const charge = event.data.object as Stripe.Charge
      const availableId =
        (charge.customer as string) ?? (charge.payment_intent as string)
      const chargeId = charge.id
      const existingInvoice = await db.query.affiliateInvoice.findFirst({
        where: (table, { eq, and, isNull }) =>
          and(eq(table.customerId, availableId), isNull(table.transactionId)),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      })

      if (existingInvoice) {
        await db
          .update(affiliateInvoice)
          .set({ transactionId: chargeId, updatedAt: new Date() })
          .where(eq(affiliateInvoice.id, existingInvoice.id))
      } else {
        await db.insert(affiliateInvoice).values({
          paymentProvider: "stripe",
          transactionId: chargeId,
          customerId: availableId,
          amount: "0.00",
          currency: "USD",
          commission: "0.00",
          paidAmount: "0.00",
          unpaidAmount: "0.00",
          reason: "placeholder_from_charge",
        })
      }
      break
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge
      const chargeId = charge.id

      const invoice = await db.query.affiliateInvoice.findFirst({
        where: (table, { eq }) => eq(table.transactionId, chargeId),
      })

      if (!invoice) {
        console.warn(`⚠️ Refund received for unknown charge: ${chargeId}`)
        break
      }

      const rawRefundAmount = charge.amount_refunded
      const refundDecimals = getCurrencyDecimals(charge.currency)
      const { amount: refundAmountInUSD } = await convertToUSD(
        rawRefundAmount,
        charge.currency,
        refundDecimals
      )

      const originalAmountUSD = parseFloat(invoice.amount || "0")
      const originalCommissionUSD = parseFloat(invoice.commission || "0")

      let newCommission = originalCommissionUSD
      if (originalAmountUSD > 0) {
        const refundAmountUSDNum = parseFloat(refundAmountInUSD)
        const refundRatio = refundAmountUSDNum / originalAmountUSD
        const commissionReduction = originalCommissionUSD * refundRatio
        newCommission = Math.max(0, originalCommissionUSD - commissionReduction)
      }

      const isFullRefund =
        charge.refunded ||
        (originalAmountUSD > 0 &&
          parseFloat(refundAmountInUSD) >= originalAmountUSD - 0.01)

      await db
        .update(affiliateInvoice)
        .set({
          refundedAt: isFullRefund ? new Date() : null,
          commission: newCommission.toFixed(2),
          unpaidAmount: newCommission.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(affiliateInvoice.id, invoice.id))

      console.log(
        `✅ Refund processed for ${chargeId}. Full refund: ${isFullRefund}`
      )
      break
    }
  }

  return NextResponse.json({ received: true })
}
