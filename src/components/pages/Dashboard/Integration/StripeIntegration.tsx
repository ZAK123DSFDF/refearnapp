"use client"

import React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import FrameworkInstructions from "@/components/pages/Dashboard/Integration/FrameworkInstructions"
import EmbedStripeCheckout from "@/components/pages/Dashboard/Integration/Stripe/EmbedStripeCheckout"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import { Loader2 } from "lucide-react"
import { AppResponse, useAppMutation } from "@/hooks/useAppMutation"

export default function StripeIntegration({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient()
  const { showCustomToast } = useCustomToast()
  // ✅ Fetch connection status
  const { data, isPending } = useQuery({
    queryKey: ["stripeStatus", orgId],
    queryFn: async () => {
      const res = await fetch("/api/stripe/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      })
      const data = (await res.json().catch(() => ({}))) as any
      if (!res.ok) {
        showCustomToast({
          type: "error",
          title: "Failed to Load Stripe Status",
          description: "Something went wrong while checking Stripe status.",
          affiliate: false,
        })
      }

      return data
    },
  })
  // ✅ Connect Mutation
  const connectMutation = useAppMutation<AppResponse, void>(
    async () => {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      })

      const data = (await res.json()) as any
      if (!res.ok) {
        return {
          ok: false,
          toast: data.error || "Failed to connect Stripe.",
        }
      }

      return { ok: true, data }
    },
    {
      onSuccess: (res) => {
        if (res.ok && res.data?.url) {
          window.location.href = res.data.url
        }
      },
    }
  )

  // ✅ Disconnect Mutation
  const disconnectMutation = useAppMutation<AppResponse, void>(
    async () => {
      const res = await fetch("/api/stripe/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      })

      const data = (await res.json()) as any
      if (!res.ok) {
        return {
          ok: false,
          toast:
            data.error || "Something went wrong while disconnecting Stripe.",
        }
      }

      return {
        ok: true,
        message: "Disconnected Successfully",
        toast: "Your Stripe account has been disconnected.",
      }
    },
    {
      onSuccess: () => {
        queryClient
          .invalidateQueries({ queryKey: ["stripeStatus", orgId] })
          .then(() => console.log("invalidated"))
      },
    }
  )

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Stripe Integration</h3>
      <Tabs defaultValue="connect" className="w-full">
        <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full h-auto gap-3 p-2">
          <TabsTrigger value="connect">Connect</TabsTrigger>
          <TabsTrigger value="disconnect">Disconnect</TabsTrigger>
          <TabsTrigger value="embed-script">Embed Script</TabsTrigger>
          <TabsTrigger value="embed-checkout">Embed Checkout</TabsTrigger>
        </TabsList>

        {/* CONNECT */}
        <TabsContent value="connect">
          <Card className="p-6 space-y-4">
            <h4 className="text-lg font-semibold">
              Connect Your Stripe Account
            </h4>
            {data?.connected ? (
              <p className="text-green-600 font-medium">
                ✅ Connected as {data.email || "Unknown Email"}
              </p>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Link your verified Stripe account to let us track your payment
                  events automatically.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> A Google Authenticator recovery code
                  will be generated during this setup. Please save it securely
                  for future account recovery.
                </p>
              </>
            )}
            <Button
              onClick={() => connectMutation.mutate()}
              disabled={data?.connected || connectMutation.isPending}
            >
              {connectMutation.isPending
                ? "Redirecting..."
                : data?.connected
                  ? "Already Connected"
                  : "Connect Stripe"}
            </Button>
          </Card>
        </TabsContent>

        {/* DISCONNECT */}
        <TabsContent value="disconnect">
          <Card className="p-6 space-y-4">
            <h4 className="text-lg font-semibold">Disconnect Stripe Account</h4>
            <p className="text-muted-foreground">
              Click below to disconnect your Stripe account.
            </p>
            <Button
              onClick={() => disconnectMutation.mutate()}
              variant="destructive"
              disabled={!data?.connected || disconnectMutation.isPending}
            >
              {disconnectMutation.isPending
                ? "Disconnecting..."
                : "Disconnect Stripe"}
            </Button>
          </Card>
        </TabsContent>

        {/* EMBED SCRIPT */}
        <TabsContent value="embed-script">
          <Card className="p-6 space-y-4">
            <h4 className="text-lg font-semibold">Embed the Tracking Script</h4>
            <p className="text-muted-foreground">
              After connecting, embed the following script for tracking.
            </p>
            <FrameworkInstructions />
          </Card>
        </TabsContent>

        {/* EMBED CHECKOUT */}
        <TabsContent value="embed-checkout">
          <EmbedStripeCheckout />
        </TabsContent>
      </Tabs>
    </div>
  )
}
