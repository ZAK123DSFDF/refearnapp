import { NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/db/drizzle"
import { affiliateInvoice, promotionCodes } from "@/db/schema"
import { eq } from "drizzle-orm"
import { convertToUSD } from "@/util/CurrencyConvert"
import { getCurrencyDecimals } from "@/util/CurrencyDecimal"
import { safeFormatAmount } from "@/util/SafeParse"
import { invoicePaidUpdate } from "@/util/InvoicePaidUpdate"
import { getAffiliateLinkRecord } from "@/services/getAffiliateLinkRecord"
import { getOrganizationById } from "@/services/getOrganizationById"
import { handleSubscriptionExpiration } from "@/lib/server/organization/handleSubscriptionExpiration"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"
import { convertReferral } from "@/util/ConvertReferral"
import { updatePromoStats } from "@/util/updatePromoStats"
import { getSubscriptionExpiration } from "@/services/getSubscriptionExpiration"
import { getOrgIdFromLink } from "@/util/getOrgFromLink"

export const POST = handleRoute("Stripe Affiliate Webhook", async (req) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
  })

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const sig = req.headers.get("stripe-signature")
  const body = await req.text()

  if (!sig || !endpointSecret) {
    throw new AppError({
      error: "MISSING_WEBHOOK_CONFIG",
      toast: "Missing signature or webhook secret",
      status: 400,
    })
  }

  // 1. Verify Event
  const event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  // 2. Handle Events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const discounts = session.discounts || []

      let affiliateLinkRecord = null
      let promoRecord = null

      // Commission settings (defaulting to null, will resolve later)
      let commissionType = null
      let commissionValue = null

      // 1. TRY PROMO CODE FIRST
      if (discounts.length > 0) {
        // Note: Stripe SDK types might need casting depending on your version
        const stripePromoId = discounts[0].promotion_code as string
        promoRecord = await db.query.promotionCodes.findFirst({
          where: (t, { eq }) => eq(t.externalId, stripePromoId),
        })

        if (promoRecord?.affiliateId) {
          affiliateLinkRecord = await db.query.affiliateLink.findFirst({
            where: (t, { eq }) => eq(t.affiliateId, promoRecord!.affiliateId!),
          })
          commissionType = promoRecord.commissionType?.toLowerCase()
          commissionValue = promoRecord.commissionValue
        }
      }

      // 2. FALLBACK TO METADATA
      if (!affiliateLinkRecord) {
        const refDataRaw = session.metadata?.refearnapp_affiliate_code
        if (refDataRaw) {
          const {
            code,
            commissionType: metaType,
            commissionValue: metaValue,
          } = JSON.parse(refDataRaw)
          affiliateLinkRecord = await getAffiliateLinkRecord(code)
          commissionType = metaType?.toLowerCase()
          commissionValue = metaValue
        }
      }

      // If no attribution found, exit
      if (!affiliateLinkRecord || !commissionType || !commissionValue) break

      const organizationRecord = await getOrganizationById(
        affiliateLinkRecord.organizationId
      )
      if (!organizationRecord) break

      // 3. REMAINING LOGIC (Using the resolved variables above)
      const mode = session.mode
      const isSubscription = mode === "subscription"
      const isTrial = isSubscription && session.amount_total === 0
      const finalReason = isSubscription
        ? isTrial
          ? "trial_start"
          : "subscription_create"
        : "one_time"

      const availableId =
        (session.customer as string) ?? (session.payment_intent as string)
      const subscriptionId = isSubscription
        ? (session.subscription as string)
        : null

      // Calculate Commission
      const rawAmount = safeFormatAmount(session.amount_total || 0)
      const rawCurrency = session.currency ?? "usd"
      const { amount } = await convertToUSD(
        parseFloat(rawAmount),
        rawCurrency,
        getCurrencyDecimals(rawCurrency)
      )

      let commission = 0
      if (commissionType === "percentage") {
        commission = (parseFloat(amount) * parseFloat(commissionValue)) / 100
      } else if (commissionType === "fixed") {
        commission = parseFloat(commissionValue)
      }

      // 1. CHECK FOR PLACEHOLDER
      const placeholder = await db.query.affiliateInvoice.findFirst({
        where: (table, { eq, and, or }) =>
          and(
            eq(table.customerId, availableId),
            or(eq(table.reason, "placeholder_from_charge"))
          ),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      })
      const affiliateLinkId = promoRecord ? null : affiliateLinkRecord?.id
      const promotionCodeId = promoRecord?.id ?? null
      // 2. UPDATE OR INSERT
      if (placeholder) {
        await db
          .update(affiliateInvoice)
          .set({
            subscriptionId,
            amount: amount.toString(),
            currency: "USD",
            rawAmount,
            rawCurrency,
            commission: commission.toString(),
            unpaidAmount: commission.toFixed(2),
            affiliateLinkId: affiliateLinkId,
            promotionCodeId: promotionCodeId,
            reason: finalReason,
            updatedAt: new Date(),
          })
          .where(eq(affiliateInvoice.id, placeholder.id))
      } else {
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
          affiliateLinkId: affiliateLinkId,
          promotionCodeId: promotionCodeId,
          reason: finalReason,
        })
      }
      if (promoRecord) {
        await updatePromoStats(promoRecord.id, amount)
      }
      if (affiliateLinkRecord && !promoRecord) {
        await convertReferral(
          session,
          affiliateLinkRecord.id,
          amount,
          commission
        )
      }

      // 3. EXPIRATION LOGIC
      if (subscriptionId) {
        const stripeAccountRecord =
          await db.query.organizationStripeAccount.findFirst({
            where: (table, { eq }) => eq(table.orgId, organizationRecord.id),
          })
        const sub = await stripe.subscriptions.retrieve(subscriptionId, {
          stripeAccount: stripeAccountRecord?.stripeAccountId,
        })
        let trialDays = 0
        if (sub.trial_end && sub.trial_start) {
          trialDays = Math.round((sub.trial_end - sub.trial_start) / 86400)
        }

        await handleSubscriptionExpiration(
          subscriptionId,
          organizationRecord,
          promoRecord,
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
        let promoRecord = null
        if (subscriptionId) {
          const expirationRecord =
            await getSubscriptionExpiration(subscriptionId)

          // Check expiration
          if (
            expirationRecord &&
            invoiceCreatedDate > expirationRecord.expirationDate
          ) {
            break
          }
          if (expirationRecord?.promotionCodeId) {
            promoRecord = await db.query.promotionCodes.findFirst({
              where: (t, { eq }) => eq(t.id, expirationRecord.promotionCodeId!),
            })
          }
        }

        const historicalRecord = await db.query.affiliateInvoice.findFirst({
          where: (table, { eq, and, ne }) =>
            and(
              eq(table.subscriptionId, subscriptionId),
              eq(table.customerId, customerId),
              ne(table.reason, "placeholder_from_charge")
            ),
        })

        if (!historicalRecord?.affiliateLinkId && !promoRecord?.id) {
          console.log(
            "⚠️ No attribution found in history or expiration record."
          )
          return NextResponse.json({ ok: true })
        }
        const placeholder = await db.query.affiliateInvoice.findFirst({
          where: (table, { eq, and }) =>
            and(
              eq(table.customerId, customerId),
              eq(table.reason, "placeholder_from_charge")
            ),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        })

        const resolvedOrgId =
          promoRecord?.organizationId ??
          (await getOrgIdFromLink(historicalRecord?.affiliateLinkId ?? null))

        if (!resolvedOrgId) {
          console.log("⚠️ No organization ID found, skipping.")
          break
        }

        const organizationRecord = await getOrganizationById(resolvedOrgId)
        if (!organizationRecord) {
          console.log("⚠️ Organization not found, skipping.")
          break
        }
        const affiliateLinkId: string | null = promoRecord
          ? null
          : (historicalRecord?.affiliateLinkId ?? null)
        if (promoRecord) {
          await updatePromoStats(
            promoRecord.id,
            String(invoice.total_excluding_tax ?? 0)
          )
        }
        await invoicePaidUpdate(
          String(invoice.total_excluding_tax ?? 0),
          invoice.currency,
          customerId,
          subscriptionId || "",
          affiliateLinkId,
          (
            promoRecord?.commissionType ??
            organizationRecord.commissionType ??
            "percentage"
          ).toLowerCase(),
          promoRecord?.commissionValue ??
            organizationRecord.commissionValue ??
            "0.00",
          placeholder?.id || null,
          promoRecord?.id || null
        )
      }
      break
    }

    case "charge.succeeded": {
      const charge = event.data.object as Stripe.Charge
      const availableId =
        (charge.customer as string) ?? (charge.payment_intent as string)

      const existingInvoice = await db.query.affiliateInvoice.findFirst({
        where: (table, { eq, and, isNull, ne }) =>
          and(
            eq(table.customerId, availableId),
            isNull(table.transactionId),
            ne(table.reason, "trial_start")
          ),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      })

      if (existingInvoice) {
        await db
          .update(affiliateInvoice)
          .set({
            transactionId: charge.id,
            updatedAt: new Date(),
          })
          .where(eq(affiliateInvoice.id, existingInvoice.id))
      } else {
        await db.insert(affiliateInvoice).values({
          paymentProvider: "stripe",
          transactionId: charge.id,
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
      const invoice = await db.query.affiliateInvoice.findFirst({
        where: (table, { eq }) => eq(table.transactionId, charge.id),
      })

      if (!invoice) break

      const refundDecimals = getCurrencyDecimals(charge.currency)
      const { amount: refundAmountInUSD } = await convertToUSD(
        charge.amount_refunded,
        charge.currency,
        refundDecimals
      )

      const originalAmountUSD = parseFloat(invoice.amount || "0")
      const originalCommissionUSD = parseFloat(invoice.commission || "0")

      let newCommission = originalCommissionUSD
      if (originalAmountUSD > 0) {
        const refundRatio = parseFloat(refundAmountInUSD) / originalAmountUSD
        newCommission = Math.max(
          0,
          originalCommissionUSD - originalCommissionUSD * refundRatio
        )
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
      break
    }
    case "promotion_code.created": {
      const promo = event.data.object as Stripe.PromotionCode
      const connectedAccountId = event.account

      if (!connectedAccountId) break
      const linkedOrgs = await db.query.organizationStripeAccount.findMany({
        where: (table, { eq }) => eq(table.stripeAccountId, connectedAccountId),
      })

      if (linkedOrgs.length === 0) break
      const promoInserts = linkedOrgs.map((link) => ({
        code: promo.code,
        externalId: promo.id,
        stripeCouponId: promo.coupon.id,
        provider: "stripe" as const,
        isActive: promo.active,
        discountType: promo.coupon.amount_off
          ? ("FLAT_FEE" as const)
          : ("PERCENTAGE" as const),
        discountValue:
          promo.coupon.percent_off?.toString() ||
          (promo.coupon.amount_off! / 100).toString(),
        commissionValue: "0.00",
        organizationId: link.orgId,
      }))
      await db
        .insert(promotionCodes)
        .values(promoInserts)
        .onConflictDoUpdate({
          target: [promotionCodes.externalId, promotionCodes.organizationId],
          set: {
            isActive: promo.active,
            updatedAt: new Date(),
          },
        })

      break
    }
    case "promotion_code.updated": {
      const promo = event.data.object as Stripe.PromotionCode
      const connectedAccountId = event.account

      if (!connectedAccountId) break
      await db
        .update(promotionCodes)
        .set({
          isActive: promo.active,
          code: promo.code,
          updatedAt: new Date(),
        })
        .where(eq(promotionCodes.externalId, promo.id))

      break
    }
    case "coupon.deleted": {
      const coupon = event.data.object as Stripe.Coupon
      await db
        .update(promotionCodes)
        .set({
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(promotionCodes.stripeCouponId, coupon.id))

      console.log(`✅ Soft-deleted all promo codes for coupon: ${coupon.id}`)
      break
    }
  }

  return NextResponse.json({ ok: true, received: true })
})
