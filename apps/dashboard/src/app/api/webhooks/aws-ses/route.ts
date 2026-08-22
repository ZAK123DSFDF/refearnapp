// app/api/webhooks/aws-ses/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		const text = await request.text()
		const body = JSON.parse(text)

		// 1. Handle initial AWS SNS Subscription Confirmation
		if (body.Type === "SubscriptionConfirmation") {
			if (body.SubscribeURL) {
				await fetch(body.SubscribeURL)
				console.log("[AWS SES Webhook] Subscription confirmed successfully!")
			}
			return new NextResponse("Subscription Confirmed", { status: 200 })
		}

		// 2. Handle Bounce or Complaint Event Notifications
		if (body.Type === "Notification") {
			const message =
				typeof body.Message === "string"
					? JSON.parse(body.Message)
					: body.Message
			const notificationType = message.notificationType

			if (notificationType === "Bounce") {
				const bouncedRecipients = message.bounce?.bouncedRecipients || []
				for (const recipient of bouncedRecipients) {
					const email = recipient.emailAddress
					console.log(`[AWS SES Webhook] Bounced email: ${email}`)
					// TODO: Update database (e.g., mark user as bounced)
				}
			}

			if (notificationType === "Complaint") {
				const complainedRecipients = message.complaint?.complainedRecipients || []
				for (const recipient of complainedRecipients) {
					const email = recipient.emailAddress
					console.log(`[AWS SES Webhook] Spam complaint from: ${email}`)
					// TODO: Update database (e.g., mark user as unsubscribed)
				}
			}
		}

		return new NextResponse("Event processed", { status: 200 })
	} catch (error) {
		console.error("[AWS SES Webhook] Error processing event:", error)
		return new NextResponse("Internal Server Error", { status: 500 })
	}
}
