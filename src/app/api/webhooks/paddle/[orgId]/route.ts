import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/db/drizzle"
import {
  affiliateInvoice,
  promotionCodes,
  subscriptionExpiration,
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { calculateTrialDays } from "@/util/CalculateTrialDays"
import { convertToUSD } from "@/util/CurrencyConvert"
import { getCurrencyDecimals } from "@/util/CurrencyDecimal"
import { safeFormatAmount } from "@/util/SafeParse"
import { addDays } from "date-fns"
import { calculateExpirationDate } from "@/util/CalculateExpiration"
import { getAffiliateLinkRecord } from "@/services/getAffiliateLinkRecord"
import { getOrganizationById } from "@/services/getOrganizationById"
import { getSubscriptionExpiration } from "@/services/getSubscriptionExpiration"
import { getPaddleAccount } from "@/lib/server/organization/getPaddleAccount"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"

type Params = { orgId: string }

export const POST = handleRoute<Params>(
  "Paddle Affiliate Webhook",
  async (request, params) => {
    const { orgId } = params
    const rawBody = await request.text()
    const signatureHeader = request.headers.get("paddle-signature")

    if (!signatureHeader) {
      throw new AppError({
        error: "MISSING_SIGNATURE",
        toast: "Missing Paddle Signature Header",
        status: 400,
      })
    }

    // 1. Get the secret directly using the orgId
    const orgPaddleAccount = await getPaddleAccount(orgId)
    if (!orgPaddleAccount) {
      throw new AppError({
        error: "ACCOUNT_NOT_FOUND",
        toast: "Paddle account not configured for this org",
        status: 404,
      })
    }

    const secret = orgPaddleAccount.webhookPublicKey

    // 2. Verify Signature
    const [tsPart, h1Part] = signatureHeader.split(";")
    const timestamp = tsPart?.split("=")[1]
    const receivedSignature = h1Part?.split("=")[1]

    if (!timestamp || !receivedSignature) {
      throw new AppError({
        error: "INVALID_SIGNATURE_FORMAT",
        status: 400,
      })
    }

    const signedPayload = `${timestamp}:${rawBody}`
    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex")

    if (computedSignature !== receivedSignature) {
      throw new AppError({
        error: "INVALID_SIGNATURE",
        toast: "Signature verification failed",
        status: 401,
      })
    }

    // 3. Parse payload only AFTER verification
    const payload = JSON.parse(rawBody)

    switch (payload.event_type) {
      case "transaction.completed": {
        const tx = payload.data
        const isSubscription = Boolean(tx.subscription_id)
        const transactionId = tx.id
        const customerId = tx.customer_id
        const subscriptionId = tx.subscription_id || null
        const rawCurrency = tx.details?.totals?.currency_code || "USD"
        const rawAmount = safeFormatAmount(tx.details?.totals?.total)
        const decimals = getCurrencyDecimals(rawCurrency)

        const { amount } = await convertToUSD(
          parseFloat(rawAmount),
          rawCurrency,
          decimals
        )

        const customData = tx.custom_data || {}
        const refDataRaw = customData.refearnapp_affiliate_code
        if (!refDataRaw) break

        const { code, commissionType, commissionValue } = JSON.parse(refDataRaw)
        const transactionTime = new Date(tx.created_at)

        let commission = 0
        if (commissionType === "percentage") {
          commission = (parseFloat(amount) * parseFloat(commissionValue)) / 100
        } else if (commissionType === "fixed") {
          commission = parseFloat(amount) < 0 ? 0 : parseFloat(commissionValue)
        }

        const affiliateLinkRecord = await getAffiliateLinkRecord(code)
        if (!affiliateLinkRecord) break

        const organizationRecord = await getOrganizationById(
          affiliateLinkRecord.organizationId
        )
        if (!organizationRecord) break

        if (isSubscription) {
          const subscriptionExpirationRecord =
            await getSubscriptionExpiration(subscriptionId)
          const existingInvoice = await db.query.affiliateInvoice.findFirst({
            where: eq(affiliateInvoice.subscriptionId, subscriptionId),
          })

          const reason = existingInvoice
            ? "subscription_update"
            : "subscription_create"

          if (!subscriptionExpirationRecord) {
            const expirationDate = calculateExpirationDate(
              new Date(),
              organizationRecord.commissionDurationValue,
              organizationRecord.commissionDurationUnit
            )

            await db.insert(subscriptionExpiration).values({
              subscriptionId,
              expirationDate,
            })
          } else if (
            transactionTime > subscriptionExpirationRecord.expirationDate
          ) {
            break
          }

          await db.insert(affiliateInvoice).values({
            paymentProvider: "paddle",
            transactionId,
            subscriptionId,
            customerId,
            amount: amount.toString(),
            currency: "USD",
            commission: commission.toString(),
            paidAmount: "0.00",
            rawCurrency,
            rawAmount,
            unpaidAmount: commission.toFixed(2),
            affiliateLinkId: affiliateLinkRecord.id,
            reason,
          })
        } else {
          await db.insert(affiliateInvoice).values({
            paymentProvider: "paddle",
            transactionId,
            subscriptionId: null,
            customerId,
            amount: amount.toString(),
            currency: "USD",
            commission: commission.toString(),
            paidAmount: "0.00",
            unpaidAmount: commission.toFixed(2),
            affiliateLinkId: affiliateLinkRecord.id,
            reason: "one_time",
          })
        }
        break
      }

      case "subscription.created": {
        const sub = payload.data
        const isTrial = sub.status === "trialing"
        if (!isTrial) break

        const subscriptionId = sub.id
        const customData = sub.custom_data || {}
        const refDataRaw = customData.refearnapp_affiliate_code
        if (!refDataRaw) break

        const { code, commissionDurationValue, commissionDurationUnit } =
          JSON.parse(refDataRaw)
        const affiliateLinkRecord = await getAffiliateLinkRecord(code)
        if (!affiliateLinkRecord) break

        const trialItem = sub.items?.[0]?.price?.trial_period
        const trialDays = calculateTrialDays(
          trialItem?.interval,
          trialItem?.frequency || 0
        )

        const baseDate = addDays(new Date(), trialDays)
        const expirationDate = calculateExpirationDate(
          baseDate,
          commissionDurationValue,
          commissionDurationUnit
        )

        const existingExpiration =
          await getSubscriptionExpiration(subscriptionId)

        if (existingExpiration) {
          await db
            .update(subscriptionExpiration)
            .set({ expirationDate })
            .where(eq(subscriptionExpiration.subscriptionId, subscriptionId))
        } else {
          await db.insert(subscriptionExpiration).values({
            subscriptionId,
            expirationDate,
          })
        }
        break
      }

      case "adjustment.updated": {
        const adjustment = payload.data
        if (
          adjustment.status === "approved" &&
          adjustment.action === "refund"
        ) {
          const invoice = await db.query.affiliateInvoice.findFirst({
            where: eq(
              affiliateInvoice.transactionId,
              adjustment.transaction_id
            ),
          })

          if (!invoice) break

          const rawRefundCurrency = adjustment.totals?.currency_code || "USD"
          const rawRefundAmount = parseFloat(adjustment.totals?.total || "0")
          const refundDecimals = getCurrencyDecimals(rawRefundCurrency)

          const { amount: refundAmountInUSD } = await convertToUSD(
            rawRefundAmount,
            rawRefundCurrency,
            refundDecimals
          )

          const originalCommissionUSD = parseFloat(invoice.commission || "0")
          const originalAmountUSD = parseFloat(invoice.amount || "0")

          if (originalAmountUSD <= 0) break

          const refundAmountUSDNum = parseFloat(refundAmountInUSD)
          const refundRatio = refundAmountUSDNum / originalAmountUSD
          const commissionReduction = originalCommissionUSD * refundRatio
          const newCommission = Math.max(
            0,
            originalCommissionUSD - commissionReduction
          )
          const isFullRefund = refundAmountUSDNum >= originalAmountUSD - 0.01

          await db
            .update(affiliateInvoice)
            .set({
              refundedAt: isFullRefund ? new Date() : null,
              commission: newCommission.toFixed(2),
              unpaidAmount: newCommission.toFixed(2),
              updatedAt: new Date(),
            })
            .where(eq(affiliateInvoice.id, invoice.id))
        }
        break
      }
      case "discount.created": {
        const discount = payload.data
        const isCurrentlyActive =
          discount.status === "active" && discount.enabled_for_checkout === true
        let mappedType: "PERCENTAGE" | "FLAT_FEE" = "PERCENTAGE"
        if (discount.type === "flat" || discount.type === "flat_per_seat") {
          mappedType = "FLAT_FEE"
        }

        await db.insert(promotionCodes).values({
          code: discount.code,
          externalId: discount.id,
          provider: "paddle",
          isActive: isCurrentlyActive,
          discountType: mappedType,
          discountValue: discount.amount,
          currency: discount.currency_code || "USD",
          organizationId: orgId,
          commissionValue: "0.00",
          commissionType: "PERCENTAGE",
        })

        console.log(
          `✅ Paddle Discount Created: ${discount.code} for Org: ${orgId}`
        )
        break
      }
      case "discount.updated": {
        const discount = payload.data
        const isCurrentlyActive =
          discount.status === "active" && discount.enabled_for_checkout === true
        let mappedType: "PERCENTAGE" | "FLAT_FEE" = "PERCENTAGE"
        if (discount.type === "flat" || discount.type === "flat_per_seat") {
          mappedType = "FLAT_FEE"
        }
        await db
          .update(promotionCodes)
          .set({
            code: discount.code,
            isActive: isCurrentlyActive,
            discountType: mappedType,
            discountValue: discount.amount,
            currency: discount.currency_code || "USD",
            updatedAt: new Date(),
          })
          .where(eq(promotionCodes.externalId, discount.id))
        console.log(
          `✅ Paddle Discount Updated: ${discount.id} | Status: ${discount.status} | Active: ${isCurrentlyActive}`
        )
        break
      }
    }

    return NextResponse.json({ received: true, ok: true }, { status: 200 })
  }
)
