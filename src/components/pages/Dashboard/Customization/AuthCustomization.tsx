"use client"

import React, { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import Login from "@/components/pages/Login"
import Signup from "@/components/pages/Signup"

import ForgotPassword from "@/components/pages/Forgot-password"
import ResetPassword from "@/components/pages/Reset-password"
import InvalidToken from "@/components/pages/InvalidToken"
import EmailVerified from "@/components/pages/Email-verified"
import CheckEmail from "@/components/pages/CheckEmail"
import PendingState from "@/components/ui-custom/PendingState"
import ErrorState from "@/components/ui-custom/ErrorState"
import { DomainHeader } from "@/components/ui-custom/DomainHeader"
interface AuthCustomizationProps {
  setMainTab?: (tab: string) => void
  orgId: string
  domain?: string
  tab: string
  setTab: (tab: string) => void
}
export const AuthCustomization = ({
  setMainTab,
  orgId,
  domain,
  tab,
  setTab,
}: AuthCustomizationProps) => {
  const routeMap: Record<string, string> = {
    login: "/login",
    signup: "/signup",
    "forgot-password": "/forgot-password",
    "reset-password": "/reset-password",
    "invalid-token": "/invalid-token",
    "email-verified": "/email-verified",
    "check-email": "/check-email",
    "splash-loading": "/",
    "splash-error": "/",
  }
  const [errorCycle, setErrorCycle] = useState<"loading" | "error">("error")

  const handleRetry = () => {
    setErrorCycle("loading")
    setTimeout(() => setErrorCycle("error"), 1500)
  }
  return (
    <div className="border rounded-lg p-4 transition-all duration-300 mt-6 shadow-md">
      {domain && (
        <DomainHeader domain={domain} route={routeMap[tab]} className="mb-4" />
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-2 mb-4 overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="forgot-password">Forgot Password</TabsTrigger>
          <TabsTrigger value="reset-password">Reset Password</TabsTrigger>
          <TabsTrigger value="invalid-token">Invalid Token</TabsTrigger>
          <TabsTrigger value="email-verified">Email Verified</TabsTrigger>
          <TabsTrigger value="check-email">Check Email</TabsTrigger>
          <TabsTrigger value="splash-loading">Splash Loading</TabsTrigger>
          <TabsTrigger value="splash-error">Splash Error</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login orgId={orgId} affiliate isPreview setTab={setTab} />
        </TabsContent>
        <TabsContent value="signup">
          <Signup orgId={orgId} affiliate isPreview setTab={setTab} />
        </TabsContent>
        <TabsContent value="forgot-password">
          <ForgotPassword orgId={orgId} affiliate isPreview setTab={setTab} />
        </TabsContent>
        <TabsContent value="reset-password">
          <ResetPassword
            orgId={orgId}
            affiliate
            isPreview
            setTab={setTab}
            userId="1234"
          />
        </TabsContent>
        <TabsContent value="invalid-token">
          <InvalidToken orgId={orgId} affiliate isPreview />
        </TabsContent>{" "}
        <TabsContent value="email-verified">
          <EmailVerified
            orgId={orgId}
            affiliate
            isPreview
            setMainTab={setMainTab}
          />
        </TabsContent>
        <TabsContent value="check-email">
          <CheckEmail affiliate isPreview orgId={orgId} />
        </TabsContent>
        <TabsContent value="splash-loading">
          <PendingState affiliate isPreview />
        </TabsContent>
        <TabsContent value="splash-error">
          {errorCycle === "loading" ? (
            <PendingState affiliate message="Retrying..." />
          ) : (
            <ErrorState affiliate isPreview onRetry={handleRetry} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
