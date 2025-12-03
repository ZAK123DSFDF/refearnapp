"use client"

import React, { useMemo, useState } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { useForm } from "react-hook-form"

import {
  logoutAction,
  updateAffiliatePassword,
  updateAffiliateProfile,
  validateCurrentPassword,
} from "@/app/affiliate/[orgId]/dashboard/profile/action"
import {
  updateUserPassword,
  updateUserProfile,
  validateCurrentOrganizationPassword,
} from "@/app/(organization)/organization/[orgId]/dashboard/profile/action"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  affiliateProfileSchema,
  teamProfileSchema,
  userProfileSchema,
} from "@/lib/schema/profileSchema"
import {
  currentPasswordSchema,
  newPasswordSchema,
} from "@/lib/schema/passwordSchema"
import { DashboardCardCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardCardCustomizationOptions"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import ProfileHeader from "@/components/pages/Dashboard/Profile/ProfileHeader"
import ProfileCardHeader from "@/components/pages/Dashboard/Profile/ProfileCardHeader"
import ProfileCardContent from "@/components/pages/Dashboard/Profile/ProfileCardContent"
import ProfileCardFooter from "@/components/pages/Dashboard/Profile/ProfileCardFooter"
import ProfileDialog from "@/components/pages/Dashboard/Profile/ProfileDialog"
import { ProfileProps } from "@/lib/types/profileTypes"
import { useDashboardCard } from "@/hooks/useDashboardCard"
import deepEqual from "fast-deep-equal"
import ProfileEmailDialog from "@/components/ui-custom/ProfileEmailDialog"
import { requestEmailChange } from "@/lib/server/requestEmailChange"
import { LogoutButton } from "@/components/ui-custom/LogoutButton"
import { useCachedValidation } from "@/hooks/useCachedValidation"
import {
  clearValidationCacheForId,
  clearValidationCachesFor,
} from "@/util/CacheUtils"
import { AppResponse, useAppMutation } from "@/hooks/useAppMutation"
import {
  updateTeamPassword,
  updateTeamProfile,
  validateCurrentTeamPassword,
} from "@/app/(organization)/organization/[orgId]/teams/dashboard/profile/action"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import { openEmailApp } from "@/util/OpenEmailApp"
import { AppDialog } from "@/components/ui-custom/AppDialog"

export default function Profile({
  AffiliateData,
  UserData,
  TeamData,
  isTeam = false,
  isPreview = false,
  affiliate = false,
  orgId,
}: ProfileProps) {
  const initialName = AffiliateData
    ? AffiliateData.name
    : isTeam
      ? (TeamData?.name ?? "")
      : (UserData?.name ?? "")

  const initialEmail = AffiliateData
    ? AffiliateData.email
    : isTeam
      ? (TeamData?.email ?? "")
      : (UserData?.email ?? "")
  const initialPaypalEmail = AffiliateData?.paypalEmail ?? ""
  const profileForm = useForm({
    resolver: zodResolver(
      affiliate
        ? affiliateProfileSchema
        : isTeam
          ? teamProfileSchema
          : userProfileSchema
    ),
    defaultValues: affiliate
      ? {
          name: initialName,
          email: initialEmail,
          paypalEmail: initialPaypalEmail,
        }
      : {
          name: initialName,
          email: initialEmail,
        },
  })
  const currentPasswordForm = useForm({
    resolver: zodResolver(currentPasswordSchema),
    defaultValues: {
      currentPassword: "",
    },
  })
  const newPasswordForm = useForm({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })
  const safeDefaults = useMemo(() => {
    if (affiliate) {
      return {
        name: initialName,
        email: initialEmail,
        paypalEmail: initialPaypalEmail,
      }
    }
    return {
      name: initialName,
      email: initialEmail,
    }
  }, [initialName, initialEmail, initialPaypalEmail])

  const currentValues = profileForm.watch()
  useVerifyTeamSession(orgId, isTeam)
  const isFormUnchanged = useMemo(() => {
    return deepEqual(currentValues, safeDefaults)
  }, [currentValues, safeDefaults])
  const dashboardCardStyle = useDashboardCard(affiliate)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [showEmailSentModal, setShowEmailSentModal] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [step, setStep] = useState<"current" | "new">("current")
  const { showCustomToast } = useCustomToast()
  const emailCache = useCachedValidation({
    id: "profile-email-change",
    orgId,
    affiliate,
    showError: (msg) =>
      showCustomToast({
        type: "error",
        title: "Failed",
        description: msg,
        affiliate,
      }),
    errorMessage: affiliate
      ? "Email already in use in this organization"
      : "Email already in use",
  })
  const passwordCache = useCachedValidation({
    id: "profile-password-change",
    orgId,
    affiliate,
    showError: (msg) =>
      showCustomToast({
        type: "error",
        title: "Failed",
        description: msg,
        affiliate,
      }),
    errorMessage: "Incorrect password.",
  })
  const updateProfile = useAppMutation<
    AppResponse,
    {
      name?: string
      email?: string
      paypalEmail?: string
    }
  >(
    async (data) => {
      if (isPreview) {
        // ✅ Explicitly return a valid AppResponse object
        return new Promise<AppResponse>((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                message: "Preview mode: profile update simulated.",
                toast: "Profile update simulated successfully.",
              }),
            1000
          )
        )
      }

      // ✅ Both functions should return AppResponse as well
      return AffiliateData
        ? updateAffiliateProfile(orgId, data)
        : isTeam
          ? updateTeamProfile(orgId, data)
          : updateUserProfile(orgId, data)
    },
    {
      affiliate,
    }
  )

  const validatePassword = useAppMutation<AppResponse, string>(
    async (password) => {
      if (isPreview) {
        return new Promise<AppResponse>((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: password === "correct123",
                message:
                  password === "correct123"
                    ? "Password validated"
                    : "Invalid password",
                toast:
                  password === "correct123"
                    ? "Password validated"
                    : "Invalid password",
              }),
            1000
          )
        )
      }

      return AffiliateData
        ? validateCurrentPassword(orgId, password)
        : isTeam
          ? validateCurrentTeamPassword(orgId, password)
          : validateCurrentOrganizationPassword(password)
    },
    {
      affiliate,
      onSuccess: (res) => {
        if (res.ok) {
          setStep("new")
          newPasswordForm.reset({ newPassword: "", confirmPassword: "" })
        } else {
          passwordCache.addFailedValue(res.data)
        }
      },
    }
  )

  const updatePassword = useAppMutation<AppResponse, string>(
    async (newPassword) => {
      if (isPreview) {
        return new Promise<AppResponse>((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                message: "Password updated successfully",
                toast: "Password updated successfully",
              }),
            1000
          )
        )
      }

      return AffiliateData
        ? updateAffiliatePassword(orgId, newPassword)
        : isTeam
          ? updateTeamPassword(orgId, newPassword)
          : updateUserPassword(newPassword)
    },
    {
      affiliate,
      onSuccess: (res) => {
        if (res.ok) {
          clearValidationCacheForId(affiliate, orgId, "profile-password-change")
          resetPasswordModal()
        }
      },
    }
  )

  const logoutMutation = useAppMutation<AppResponse, void>(
    async () => {
      if (isPreview) {
        return new Promise<AppResponse>((resolve) =>
          setTimeout(() => resolve({ ok: true }), 1000)
        )
      }

      return logoutAction({ affiliate, isTeam, orgId })
    },
    {
      affiliate,
      onSuccess: (res) => {
        clearValidationCachesFor(affiliate, orgId)
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl
        }
      },
    }
  )

  const emailChangeMutation = useAppMutation<AppResponse, { newEmail: string }>(
    async (values) => {
      if (isPreview) {
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                message: "Preview email change simulated.",
              }),
            500
          )
        )
      }
      return requestEmailChange({
        orgId,
        id: affiliate
          ? AffiliateData?.id!
          : isTeam
            ? TeamData?.id!
            : UserData?.id!,
        newEmail: values.newEmail,
        isAffiliate: affiliate,
        isTeam,
      })
    },
    {
      affiliate,
      disableSuccessToast: true,
      onSuccess: (res, values) => {
        if (!res.ok) {
          emailCache.addFailedValue(res.data)
          return
        }
        setPendingEmail(values.newEmail)
        setShowEmailSentModal(true)
      },
    }
  )
  const onSubmit = (data: typeof safeDefaults) => {
    const changed = (Object.keys(data) as (keyof typeof data)[]).reduce(
      (acc, key) => {
        if (!deepEqual(data[key], safeDefaults[key])) {
          acc[key] = data[key]
        }
        return acc
      },
      {} as Partial<typeof data>
    )

    if (Object.keys(changed).length === 0) return

    updateProfile.mutate(changed)
  }
  const onSubmitValidateCurrent = (data: any) => {
    const password = data.currentPassword.trim()
    if (passwordCache.shouldSkip(password)) return
    validatePassword.mutate(data.currentPassword)
  }
  const onSubmitUpdatePassword = (data: any) => {
    updatePassword.mutate(data.newPassword)
  }

  const resetPasswordModal = () => {
    setShowPasswordModal(false)
    setStep("current")
    currentPasswordForm.reset()
    newPasswordForm.reset()
  }
  const handleEmailSubmit = (values: { newEmail: string }) => {
    const newEmail = values.newEmail.trim().toLowerCase()
    if (emailCache.shouldSkip(newEmail)) return
    emailChangeMutation.mutate(values)
  }
  return (
    <div className="flex flex-col gap-6 ">
      <ProfileHeader affiliate={affiliate} isPreview={isPreview} />

      <Card className="relative" style={dashboardCardStyle}>
        {isPreview && (
          <div className="absolute bottom-0 left-0 p-2">
            <DashboardCardCustomizationOptions
              triggerSize="w-6 h-6"
              dropdownSize="w-[150px]"
            />
          </div>
        )}{" "}
        <CardHeader>
          <ProfileCardHeader affiliate={affiliate} isPreview={isPreview} />
        </CardHeader>
        <CardContent className="space-y-8">
          <ProfileCardContent
            profileForm={profileForm}
            onSubmit={onSubmit}
            setShowPasswordModal={setShowPasswordModal}
            setShowEmailDialog={setShowEmailDialog}
            affiliate={affiliate}
            isPreview={isPreview}
            data={{
              canChangeEmail: affiliate
                ? AffiliateData?.canChangeEmail
                : isTeam
                  ? TeamData?.canChangeEmail
                  : UserData?.canChangeEmail,
              canChangePassword: affiliate
                ? AffiliateData?.canChangePassword
                : isTeam
                  ? TeamData?.canChangePassword
                  : UserData?.canChangePassword,
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-end pt-6 space-x-3">
          <ProfileCardFooter
            updateProfile={updateProfile}
            isFormUnchanged={isFormUnchanged}
            affiliate={affiliate}
            isPreview={isPreview}
          />
          <LogoutButton
            affiliate={affiliate}
            isPreview={isPreview}
            logoutMutation={logoutMutation}
          />
        </CardFooter>
      </Card>
      <ProfileDialog
        showPasswordModal={showPasswordModal}
        resetPasswordModal={resetPasswordModal}
        currentPasswordForm={currentPasswordForm}
        newPasswordForm={newPasswordForm}
        onSubmitValidateCurrent={onSubmitValidateCurrent}
        onSubmitUpdatePassword={onSubmitUpdatePassword}
        validatePassword={validatePassword}
        updatePassword={updatePassword}
        step={step}
        affiliate={affiliate}
        isPreview={isPreview}
      />
      <ProfileEmailDialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        affiliate={affiliate}
        onSubmit={handleEmailSubmit}
        loading={emailChangeMutation.isPending}
      />
      <AppDialog
        open={showEmailSentModal}
        onOpenChange={setShowEmailSentModal}
        title="Check your email"
        affiliate={affiliate}
        description="We sent a verification link to your new email address. Please open your email app to continue."
        confirmText="Open Email App"
        onConfirm={() => openEmailApp(pendingEmail ?? "", isPreview)}
      />
    </div>
  )
}
