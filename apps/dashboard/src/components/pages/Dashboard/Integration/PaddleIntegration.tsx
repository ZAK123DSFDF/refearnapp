"use client"

import React, { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FrameworkInstructions from "@/components/pages/Dashboard/Integration/FrameworkInstructions"
import Connect from "@/components/pages/Dashboard/Integration/Paddle/Connect"
import Disconnect from "@/components/pages/Dashboard/Integration/Paddle/Disconnect"
import EmbedCheckout from "@/components/pages/Dashboard/Integration/Paddle/EmbedCheckout"
import { Card } from "@/components/ui/card"
import { PaddleImageProvider } from "@/provider/PaddleImageProvider"
import { PaddleImageDialog } from "@/components/ui-custom/PaddleImageDialog"
import SignupTrackingInstructions from "@/components/pages/Dashboard/Integration/SignupTrackingInstructions"

export default function PaddleIntegration({
  orgId,
  isTeam = false,
}: {
  orgId: string
  isTeam?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentOrigin = window.location.origin

      setWebhookUrl(`${currentOrigin}/api/webhooks/paddle/${orgId}`)
    }
  }, [orgId])
  const handleCopy = () => {
    navigator.clipboard
      .writeText(webhookUrl)
      .then(() => console.log("Webhook URL copied to clipboard"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="space-y-10">
      <PaddleImageProvider>
        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full h-auto gap-3 p-2">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="disconnect">Disconnect</TabsTrigger>
            <TabsTrigger value="embedScript">Embed Script</TabsTrigger>
            <TabsTrigger value="track-signup">Track Signup</TabsTrigger>
            <TabsTrigger value="embedCheckout">Embed Checkout</TabsTrigger>
          </TabsList>

          {/* CONNECT PADDLE */}
          <TabsContent value="connect">
            <Connect
              WEBHOOK_URL={webhookUrl}
              copied={copied}
              handleCopy={handleCopy}
              orgId={orgId}
              isTeam={isTeam}
            />
          </TabsContent>

          {/* DISCONNECT PADDLE */}
          <TabsContent value="disconnect">
            <Disconnect orgId={orgId} isTeam={isTeam} />
          </TabsContent>

          {/* EMBED SCRIPT */}
          <TabsContent value="embedScript">
            <Card className="p-6 space-y-4">
              <h4 className="text-lg font-semibold">
                Embed the Tracking Script
              </h4>
              <p className="text-muted-foreground">
                After connecting, embed the following script for tracking.
              </p>
              <FrameworkInstructions />
            </Card>
          </TabsContent>
          <TabsContent value="track-signup">
            <Card className="p-6">
              <SignupTrackingInstructions />
            </Card>
          </TabsContent>
          {/* EMBED CHECKOUT */}
          <TabsContent value="embedCheckout">
            <EmbedCheckout />
          </TabsContent>
        </Tabs>
        <PaddleImageDialog />
      </PaddleImageProvider>
    </div>
  )
}
