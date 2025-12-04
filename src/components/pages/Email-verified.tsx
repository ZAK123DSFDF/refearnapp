"use client"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/ThemeCustomizationOptions"
import { CardCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/CardCustomizationOptions"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/ButtonCustomizationOptions"
import { useRouter } from "next/navigation"
import { useAuthCard } from "@/hooks/useAuthCard"
import { useAtomValue } from "jotai"
import {
  buttonCustomizationAtom,
  themeCustomizationAtom,
} from "@/store/AuthCustomizationAtom"
import { useAffiliatePath } from "@/hooks/useUrl"
type CustomMessages = {
  signup?: string
  login?: string
  changeEmail?: string
}
type Props = {
  orgId?: string
  isPreview?: boolean
  setMainTab?: (tab: string) => void
  affiliate: boolean
  mode?: "signup" | "login" | "changeEmail"
  customMessages?: CustomMessages
  isTeam?: boolean
}

const EmailVerified = ({
  orgId,
  isPreview,
  setMainTab,
  affiliate,
  mode,
  customMessages,
  isTeam,
}: Props) => {
  const {
    backgroundColor,
    emailVerifiedPrimaryColor,
    emailVerifiedSecondaryColor,
    emailVerifiedIconColor,
  } = useAtomValue(themeCustomizationAtom)
  const { buttonBackgroundColor, buttonTextColor } = useAtomValue(
    buttonCustomizationAtom
  )
  const authCardStyle = useAuthCard(affiliate)
  const message =
    (mode && customMessages?.[mode]) ||
    "Your email address has been successfully verified. You can now access all features."
  const router = useRouter()
  const { goTo } = useAffiliatePath(orgId)
  const handleClick = () => {
    if (isPreview) {
      setMainTab?.("sidebar")
    } else {
      if (affiliate) {
        goTo("dashboard/analytics")
      } else if (isTeam) {
        router.push(`/organization/${orgId}/teams/dashboard/analytics`)
      } else {
        if ((mode === "signup" || mode === "login") && !orgId) {
          router.push("/create-company")
        } else {
          router.push(`/organization/${orgId}/dashboard/analytics`)
        }
      }
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
      <div className="relative w-full max-w-md">
        <Card
          className="relative transition-shadow duration-300"
          style={authCardStyle}
        >
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="flex flex-row gap-2 justify-center">
              <CheckCircle2
                className="w-16 h-16 text-green-500"
                style={{
                  color: (affiliate && emailVerifiedIconColor) || undefined,
                }}
              />
              {isPreview && (
                <ThemeCustomizationOptions
                  name="emailVerifiedIconColor"
                  showLabel={false}
                  buttonSize="w-4 h-4"
                />
              )}
            </div>
            <div className="flex flex-row gap-2 justify-center">
              <CardTitle
                className="text-2xl font-bold text-center text-green-600"
                style={{
                  color: (affiliate && emailVerifiedPrimaryColor) || undefined,
                }}
              >
                Email Verified!
              </CardTitle>
              {isPreview && (
                <ThemeCustomizationOptions
                  name="emailVerifiedPrimaryColor"
                  showLabel={false}
                  buttonSize="w-4 h-4"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-row gap-2 justify-center">
              <p
                className="text-muted-foreground mb-4"
                style={{
                  color:
                    (affiliate && emailVerifiedSecondaryColor) || undefined,
                }}
              >
                {message}
              </p>
              {isPreview && (
                <ThemeCustomizationOptions
                  name="emailVerifiedSecondaryColor"
                  showLabel={false}
                  buttonSize="w-4 h-4"
                />
              )}
            </div>

            <Button
              className="w-full mb-6"
              size="lg"
              onClick={handleClick}
              style={{
                backgroundColor:
                  (affiliate && buttonBackgroundColor) || undefined,
                color: (affiliate && buttonTextColor) || undefined,
              }}
            >
              {mode === "signup" && !orgId
                ? "Go to Create Company"
                : "Go to Dashboard"}
            </Button>
          </CardContent>
        </Card>

        {isPreview && (
          <div className="absolute bottom-0 right-0 p-2">
            <ButtonCustomizationOptions onlyShowEnabled size="w-6 h-6" />
          </div>
        )}

        {isPreview && (
          <div className="absolute bottom-0 left-0 p-2">
            <CardCustomizationOptions
              triggerSize="w-6 h-6"
              dropdownSize="w-[150px]"
            />
          </div>
        )}
      </div>

      {isPreview && (
        <div className="absolute bottom-0 left-0 z-50">
          <ThemeCustomizationOptions name="backgroundColor" showLabel={false} />
        </div>
      )}
    </div>
  )
}

export default EmailVerified
