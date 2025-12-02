"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/ThemeCustomizationOptions"
import { CardCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/CardCustomizationOptions"
import { useAuthCard } from "@/hooks/useAuthCard"
import { useAtomValue } from "jotai"
import {
  buttonCustomizationAtom,
  themeCustomizationAtom,
} from "@/store/AuthCustomizationAtom"
import { Button } from "@/components/ui/button"
import { ButtonCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/ButtonCustomizationOptions"
import { openEmailApp } from "@/util/OpenEmailApp"

type Props = {
  orgId?: string
  isPreview?: boolean
  affiliate: boolean
}

const CheckEmail = ({ isPreview, affiliate }: Props) => {
  const { backgroundColor, checkEmailPrimaryColor, checkEmailSecondaryColor } =
    useAtomValue(themeCustomizationAtom)
  const { buttonBackgroundColor, buttonTextColor } = useAtomValue(
    buttonCustomizationAtom
  )
  const authCardStyle = useAuthCard(affiliate)

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center p-4 ${
        affiliate && backgroundColor
          ? ""
          : "bg-gradient-to-b from-background to-background/80"
      }`}
      style={{ backgroundColor: (affiliate && backgroundColor) || undefined }}
    >
      <div className="w-full max-w-md">
        <Card
          className={`relative transition-shadow duration-300 ${
            isPreview ? "pb-8" : ""
          }`}
          style={authCardStyle}
        >
          <CardHeader className="space-y-1">
            <div className="flex flex-row gap-2 justify-center">
              <CardTitle
                className="text-2xl font-bold text-center"
                style={{
                  color: (affiliate && checkEmailPrimaryColor) || undefined,
                }}
              >
                Check Your Email
              </CardTitle>
              {isPreview && (
                <ThemeCustomizationOptions
                  name="checkEmailPrimaryColor"
                  showLabel={false}
                  buttonSize="w-4 h-4"
                />
              )}
            </div>
          </CardHeader>

          <CardContent className="text-center">
            <div className="flex flex-col gap-2 justify-center">
              <p
                className="text-muted-foreground"
                style={{
                  color: (affiliate && checkEmailSecondaryColor) || undefined,
                }}
              >
                We’ve sent a verification email to your inbox. Please check your
                email and follow the link to complete login.
              </p>
              <div className="flex items-start justify-center gap-2 mt-2 mb-4">
                <p
                  className="text-muted-foreground"
                  style={{
                    color: (affiliate && checkEmailSecondaryColor) || undefined,
                  }}
                >
                  If you don’t see it, check your spam folder or try again.
                </p>

                {isPreview && (
                  <ThemeCustomizationOptions
                    name="checkEmailSecondaryColor"
                    showLabel={false}
                    buttonSize="w-4 h-4"
                  />
                )}
              </div>
            </div>
            <Button
              className="w-full mb-6 mt-2"
              size="lg"
              onClick={() => openEmailApp(isPreview)}
              style={{
                backgroundColor:
                  (affiliate && buttonBackgroundColor) || undefined,
                color: (affiliate && buttonTextColor) || undefined,
              }}
            >
              Open Your Email App
            </Button>
          </CardContent>

          {isPreview && (
            <div className="absolute bottom-0 left-0 p-2">
              <CardCustomizationOptions
                triggerSize="w-6 h-6"
                dropdownSize="w-[150px]"
              />
            </div>
          )}
          {isPreview && (
            <div className="absolute bottom-0 right-0 p-2">
              <ButtonCustomizationOptions onlyShowEnabled size="w-6 h-6" />
            </div>
          )}
        </Card>
      </div>

      {isPreview && (
        <div className="absolute bottom-0 left-0 z-50">
          <ThemeCustomizationOptions name="backgroundColor" showLabel={false} />
        </div>
      )}
    </div>
  )
}

export default CheckEmail
