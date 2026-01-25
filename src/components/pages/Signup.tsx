"use client"
import React, { useState } from "react"
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { InputField } from "@/components/Auth/FormFields"
import { SignUpFormValues, signUpSchema } from "@/lib/schema/signupSchema"
import { SignupAffiliateServer } from "@/app/affiliate/[orgId]/(auth)/signup/action"
import { SignupServer } from "@/app/(organization)/(auth)/signup/action"

import { CardCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/CardCustomizationOptions"
import { InputCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/InputCustomizationOptions"
import { InlineNotesEditor } from "@/components/ui-custom/InlineEditor"
import { ButtonCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/ButtonCustomizationOptions"
import { ThemeCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/ThemeCustomizationOptions"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import { LinkButton } from "@/components/ui-custom/LinkButton"
import { IsRichTextEmpty } from "@/util/IsRichTextEmpty"
import { useAuthCard } from "@/hooks/useAuthCard"
import { useAtomValue } from "jotai"
import {
  buttonCustomizationAtom,
  notesCustomizationAtom,
  themeCustomizationAtom,
} from "@/store/AuthCustomizationAtom"
import { GoogleButton } from "@/components/ui-custom/GoogleButton"
import { GoogleButtonCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/GoogleButtonCustomizationOptions"
import { cn } from "@/lib/utils"
import { useAffiliatePath } from "@/hooks/useUrl"
import { useCachedValidation } from "@/hooks/useCachedValidation"
import { OrgHeader } from "@/components/ui-custom/OrgHeader"
import { useAppMutation } from "@/hooks/useAppMutation"
import { SignupTeamServer } from "@/app/(organization)/organization/[orgId]/teams/(auth)/signup/action"
type Props = {
  orgId?: string
  isPreview?: boolean
  setTab?: (tab: string) => void
  affiliate: boolean
  isTeam?: boolean
}
const Signup = ({
  orgId,
  isPreview = false,
  setTab,
  affiliate,
  isTeam = false,
}: Props) => {
  const [previewLoading, setPreviewLoading] = useState(false)
  const { customNotesSignup } = useAtomValue(notesCustomizationAtom)
  const urlParams = new URLSearchParams(window.location.search)
  const txnId = urlParams.get("txn")
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const {
    backgroundColor,
    linkTextColor,
    tertiaryTextColor,
    googleSeparatorColor,
  } = useAtomValue(themeCustomizationAtom)
  const {
    buttonDisabledTextColor,
    buttonBackgroundColor,
    buttonDisabledBackgroundColor,
    buttonTextColor,
  } = useAtomValue(buttonCustomizationAtom)
  const authCardStyle = useAuthCard(affiliate)
  const { showCustomToast } = useCustomToast()
  const { getPath } = useAffiliatePath(orgId)
  const emailCache = useCachedValidation({
    id: "signup-email",
    orgId: orgId,
    affiliate,
    showError: (msg) =>
      showCustomToast({
        type: "error",
        title: "Failed",
        description: msg,
        affiliate,
      }),
    errorMessage: affiliate
      ? "This email is already registered with credentials under this organization."
      : "This email is already registered",
    maxCacheSize: 10,
  })
  const affiliateMutation = useAppMutation(SignupAffiliateServer, {
    affiliate,
    disableSuccessToast: true,
    onSuccess: (res: any) => {
      if (!res.ok) {
        emailCache.addFailedValue(res.data)
      }
    },
  })
  const teamMutation = useAppMutation(SignupTeamServer, {
    affiliate,
    disableSuccessToast: true,
    onSuccess: (res: any) => {
      if (!res.ok) {
        emailCache.addFailedValue(res.data)
      }
    },
  })
  const normalMutation = useAppMutation(SignupServer, {
    affiliate,
    disableSuccessToast: true,
    onSuccess: (res: any) => {
      if (!res.ok) {
        emailCache.addFailedValue(res.data)
      }
    },
  })
  const isLoading = isPreview
    ? previewLoading
    : isTeam
      ? teamMutation.isPending
      : orgId
        ? affiliateMutation.isPending
        : normalMutation.isPending

  const onSubmit = async (data: any) => {
    if (isPreview) {
      setPreviewLoading(true)
      await new Promise((res) => setTimeout(res, 1500))
      setPreviewLoading(false)

      if (data.email === "already@used.com") {
        showCustomToast({
          type: "error",
          title: "Signup Failed",
          description: "This Email Already Registered",
          affiliate,
        })
      } else {
        showCustomToast({
          type: "success",
          title: "Signup Successful",
          description: "Your Account Have Created",
          affiliate,
        })
      }

      return
    }
    if (isTeam && orgId) {
      const email = data.email.trim().toLowerCase()
      if (emailCache.shouldSkip(email)) return
      teamMutation.mutate({ ...data, organizationId: orgId })
    } else if (orgId && affiliate) {
      const email = data.email.trim().toLowerCase()
      if (emailCache.shouldSkip(email)) return
      affiliateMutation.mutate({ ...data, organizationId: orgId })
    } else {
      const email = data.email.trim().toLowerCase()
      if (emailCache.shouldSkip(email)) return
      normalMutation.mutate({ ...data, transactionId: txnId })
    }
  }
  return (
    <div
      className={`relative min-h-screen flex items-center justify-center p-4 ${
        affiliate && backgroundColor
          ? ""
          : "bg-gradient-to-b from-background to-background/80"
      }`}
      style={{
        backgroundColor: (affiliate && backgroundColor) || undefined,
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <OrgHeader
            orgId={orgId}
            affiliate={affiliate}
            isPreview={isPreview}
          />
        </div>

        <Card
          className="relative transition-shadow duration-300 "
          style={authCardStyle}
        >
          <CardHeader className="space-y-1">
            {isPreview ? (
              <InlineNotesEditor name="customNotesSignup" />
            ) : affiliate && !IsRichTextEmpty(customNotesSignup) ? (
              <div
                className="rich-text-preview"
                dangerouslySetInnerHTML={{ __html: customNotesSignup }}
              />
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center">
                  Create An Account
                </h2>
                <p className="text-center text-muted-foreground">
                  Enter Your Information to Sign Up
                </p>
              </>
            )}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="relative space-y-4"
              >
                {isPreview && (
                  <div className="absolute top-[-10] right-0 z-50">
                    <InputCustomizationOptions size="w-6 h-6" />
                  </div>
                )}
                <InputField
                  control={form.control}
                  name="name"
                  label="Full name"
                  placeholder="john doe"
                  type="text"
                  icon={User}
                  affiliate={affiliate}
                />

                <InputField
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="john.doe@example.com"
                  type="email"
                  icon={Mail}
                  affiliate={affiliate}
                />

                <InputField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  icon={Lock}
                  showPasswordToggle={true}
                  affiliate={affiliate}
                />

                <InputField
                  control={form.control}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="••••••••"
                  type="password"
                  icon={Lock}
                  showPasswordToggle={true}
                  affiliate={affiliate}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading
                      ? (affiliate && buttonDisabledBackgroundColor) ||
                        undefined
                      : (affiliate && buttonBackgroundColor) || undefined,
                    color: isLoading
                      ? (affiliate && buttonDisabledTextColor) || undefined
                      : (affiliate && buttonTextColor) || undefined,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        style={{
                          color:
                            (affiliate && buttonDisabledTextColor) || undefined,
                        }}
                      />
                      Please wait...
                    </>
                  ) : (
                    <>
                      Sign up{" "}
                      <ArrowRight
                        className="h-4 w-4"
                        style={{
                          color: (affiliate && buttonTextColor) || undefined,
                        }}
                      />
                    </>
                  )}
                </Button>
                {isPreview && <ButtonCustomizationOptions size="w-6 h-6" />}
              </form>
            </Form>
            {!isTeam && (
              <>
                <div className={cn("relative", !isPreview && "my-6")}>
                  <div className="absolute inset-0 flex items-center">
                    <span
                      className="w-full border-t"
                      style={{
                        borderColor:
                          (affiliate && googleSeparatorColor) || undefined,
                      }}
                    />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span
                      className="bg-background px-2 text-muted-foreground"
                      style={{
                        color: (affiliate && googleSeparatorColor) || undefined,
                      }}
                    >
                      Or continue with
                    </span>
                  </div>
                </div>

                {isPreview && (
                  <div className="mb-2">
                    <ThemeCustomizationOptions
                      name="googleSeparatorColor"
                      showLabel={false}
                      buttonSize="w-4 h-4"
                    />
                  </div>
                )}

                <div className={cn(!isPreview && "mt-4 mb-6")}>
                  <GoogleButton
                    affiliate={affiliate}
                    orgId={orgId || ""}
                    isPreview={isPreview}
                    page="signup"
                    isTeam={isTeam}
                  />
                </div>

                {isPreview && (
                  <div className="mt-2">
                    <GoogleButtonCustomizationOptions size="w-6 h-6" />
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div
              className="text-center text-sm"
              style={{
                color: (affiliate && tertiaryTextColor) || undefined,
              }}
            >
              <div className="flex flex-row gap-2">
                {isPreview && (
                  <ThemeCustomizationOptions
                    name="tertiaryTextColor"
                    showLabel={false}
                    buttonSize="w-4 h-4"
                  />
                )}
                <span>Already have an account?</span>
              </div>
              <div className="flex flex-row gap-2 justify-center">
                {isPreview && (
                  <ThemeCustomizationOptions
                    name="linkTextColor"
                    showLabel={false}
                    buttonSize="w-4 h-4"
                  />
                )}
                <LinkButton
                  isPreview={isPreview}
                  label="Login"
                  tabName="login"
                  href={
                    isTeam && orgId
                      ? `/organization/${orgId}/teams/login`
                      : affiliate && orgId
                        ? getPath("login")
                        : "/login"
                  }
                  setTab={setTab}
                  linkTextColor={linkTextColor}
                />
              </div>
            </div>
          </CardFooter>
          {isPreview && (
            <div className="absolute bottom-0 left-0 p-2">
              <CardCustomizationOptions
                triggerSize="w-6 h-6"
                dropdownSize="w-[150px]"
              />
            </div>
          )}
        </Card>
      </div>
      {isPreview && (
        <div className="absolute bottom-0 left-0 z-50">
          <ThemeCustomizationOptions
            buttonSize="w-4 h-4 lg:w-8 lg:h-8"
            name="backgroundColor"
            showLabel={false}
          />
        </div>
      )}
    </div>
  )
}

export default Signup
