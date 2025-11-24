"use client"

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import deepEqual from "fast-deep-equal"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MutationData } from "@/lib/types/response"
import {
  BadgeDollarSign,
  Building2,
  Calendar,
  Clock,
  Coins,
  Globe,
  Link2,
  Loader2,
  Percent,
  History,
  Target,
} from "lucide-react"
import { z } from "zod"

import {
  updateOrgSettings,
  verifyARecord,
  verifyCNAME,
} from "@/app/(organization)/organization/[orgId]/dashboard/settings/action"
import { orgSettingsSchema } from "@/lib/schema/orgSettingSchema"
import React, { useEffect, useMemo, useState } from "react"
import { InputField } from "@/components/Auth/FormFields"
import { SelectField } from "@/components/ui-custom/SelectFields"
import { LogoUpload } from "@/components/ui-custom/LogoUpload"
import { OrgData } from "@/lib/types/organization"
import { DomainInputField } from "@/components/ui-custom/DomainInputField"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import { useCachedValidation } from "@/hooks/useCachedValidation"
import { useAppMutation } from "@/hooks/useAppMutation"
import {
  updateTeamOrgSettings,
  verifyTeamARecord,
  verifyTeamCNAME,
} from "@/app/(organization)/organization/[orgId]/teams/dashboard/settings/action"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import { FormSection } from "@/components/ui-custom/FormSection"

type OrgFormData = z.infer<typeof orgSettingsSchema>
type Props = { orgData: OrgData }

export default function Settings({
  orgData,
  isTeam = false,
}: Props & { isTeam?: boolean }) {
  useVerifyTeamSession(orgData.id, isTeam)
  const { showCustomToast } = useCustomToast()
  const safeDefaults: OrgFormData = {
    id: orgData?.id ?? "",
    name: orgData?.name ?? "",
    websiteUrl: orgData?.websiteUrl ?? "",
    logoUrl: orgData?.logoUrl ?? null,
    referralParam: (orgData?.referralParam as "ref" | "via" | "aff") ?? "ref",
    cookieLifetimeValue: String(orgData?.cookieLifetimeValue ?? "30"),
    cookieLifetimeUnit:
      (orgData?.cookieLifetimeUnit as "day" | "week" | "month" | "year") ??
      "day",
    commissionType:
      (orgData?.commissionType as "percentage" | "fixed") ?? "percentage",
    commissionValue: String(Number(orgData.commissionValue ?? 0)),
    commissionDurationValue: String(orgData?.commissionDurationValue ?? "30"),
    commissionDurationUnit:
      (orgData?.commissionDurationUnit as "day" | "week" | "month" | "year") ??
      "day",
    defaultDomain: orgData?.defaultDomain ?? "",
    currency:
      (orgData?.currency as "USD" | "EUR" | "GBP" | "CAD" | "AUD") ?? "USD",
    attributionModel:
      (orgData?.attributionModel as "FIRST_CLICK" | "LAST_CLICK") ??
      "LAST_CLICK",
  }

  const form = useForm<OrgFormData>({
    resolver: zodResolver(orgSettingsSchema),
    defaultValues: safeDefaults,
  })
  const currentValues = form.watch()
  const [isVerified, setIsVerified] = useState(false)
  const [domainType, setDomainType] = useState<
    "platform" | "custom-main" | "custom-subdomain" | null
  >(null)
  const [open, setOpen] = useState<boolean>(false)
  const domainValue = form.watch("defaultDomain")?.trim() || ""
  const oldDomain = safeDefaults.defaultDomain.trim()
  const domainChanged = domainValue !== oldDomain
  const normalizeDomain = (value: string) => {
    if (!value) return ""
    const lower = value
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
    return lower.endsWith(".refearnapp.com")
      ? lower.replace(".refearnapp.com", "")
      : lower
  }
  const updateFn = isTeam ? updateTeamOrgSettings : updateOrgSettings
  const verifyARecordFn = isTeam ? verifyTeamARecord : verifyARecord
  const verifyCNAMEFn = isTeam ? verifyTeamCNAME : verifyCNAME
  const nonDomainFieldsChanged = useMemo(() => {
    const current = form.getValues()
    return Object.keys(safeDefaults).some(
      (key) =>
        key !== "defaultDomain" &&
        !deepEqual(
          current[key as keyof OrgFormData],
          safeDefaults[key as keyof OrgFormData]
        )
    )
  }, [form.watch(), safeDefaults])

  const onlyDomainChanged = domainChanged && !nonDomainFieldsChanged

  // 👇 dynamic button label
  const checkLabel =
    domainType === "custom-main"
      ? "Check Custom Domain"
      : domainType === "custom-subdomain"
        ? "Check Custom Subdomain"
        : "Check Domain"
  const isFormUnchanged = useMemo(() => {
    const current = {
      ...currentValues,
      defaultDomain: normalizeDomain(currentValues.defaultDomain),
    }
    const defaults = {
      ...safeDefaults,
      defaultDomain: normalizeDomain(safeDefaults.defaultDomain),
    }
    return deepEqual(current, defaults)
  }, [currentValues, safeDefaults])
  useEffect(() => {
    if (isVerified) setIsVerified(false)
  }, [domainValue, domainType])
  const domainCache = useCachedValidation({
    id: "org-settings-domain",
    orgId: orgData.id,
    affiliate: false,
    showError: (msg) =>
      showCustomToast({
        type: "error",
        title: "Failed",
        description: msg,
        affiliate: false,
      }),
    errorMessage:
      "This domain is already linked to another organization. Please use a different domain.",
  })
  const mut = useAppMutation<MutationData, Partial<OrgData> & { id: string }>(
    async (data) => updateFn(data),
    {
      affiliate: false,
      onSuccess: (res) => {
        if (res.ok) {
          form.reset(form.getValues())
        } else {
          domainCache.addFailedValue(res.data)
        }
      },
    }
  )

  const verifyMut = useAppMutation<MutationData, void>(
    async () => {
      const domain = form.getValues("defaultDomain").trim()
      if (!domain) {
        showCustomToast({
          type: "error",
          title: "Missing Domain",
          description: "Please enter a domain before verifying.",
          affiliate: false,
        })
        return { ok: false, data: null } as MutationData
      }

      if (domainType === "custom-main") {
        return verifyARecordFn(domain)
      }

      if (domainType === "custom-subdomain") {
        return verifyCNAMEFn(domain)
      }
      showCustomToast({
        type: "error",
        title: "Invalid Domain Type",
        description: "Please select a valid domain type before verifying.",
        affiliate: false,
      })

      return { ok: false, data: null } as MutationData
    },
    {
      affiliate: false,
      onSuccess: (res) => {
        if (res.ok) {
          setIsVerified(true)
          setOpen(false)
        } else {
          setIsVerified(false)
        }
      },
    }
  )

  const onSubmit = (data: OrgFormData) => {
    const newDomain = normalizeDomain(data.defaultDomain)

    const oldDomain = normalizeDomain(safeDefaults.defaultDomain)
    const finalDomain = newDomain.endsWith(".refearnapp.com")
      ? newDomain
      : /^[a-z0-9-]+$/.test(newDomain)
        ? `${newDomain}.refearnapp.com`
        : newDomain
    if (domainCache.shouldSkip(finalDomain)) return
    const changed = (Object.keys(data) as (keyof OrgData)[]).reduce(
      (acc, key) => {
        if (key === "defaultDomain") {
          if (finalDomain !== oldDomain) {
            acc[key] = finalDomain as any
          }
        } else if (!deepEqual(data[key], safeDefaults[key])) {
          acc[key] = data[key] as any
        }
        return acc
      },
      {} as Partial<OrgData>
    )

    if (Object.keys(changed).length === 0) return

    mut.mutate({ id: data.id, ...changed })
  }
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold">Organization Settings</h1>
            <p className="text-muted-foreground">
              Manage your affiliate setup and configuration
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  control={form.control}
                  name="name"
                  label="Company Name"
                  placeholder="Enter your name"
                  type="text"
                  icon={Building2}
                  affiliate={false}
                />{" "}
                <InputField
                  control={form.control}
                  name="websiteUrl"
                  label="Website URL"
                  placeholder="Enter your Domain"
                  type="text"
                  icon={Globe}
                  affiliate={false}
                />
                <SelectField
                  control={form.control}
                  name="attributionModel"
                  label="attribution model"
                  placeholder="attribution model"
                  options={[
                    { value: "FIRST_CLICK", label: "first_click" },
                    { value: "LAST_CLICK", label: "last_click" },
                  ]}
                  icon={
                    form.watch("attributionModel") === "FIRST_CLICK"
                      ? Target
                      : History
                  }
                  affiliate={false}
                />
                <SelectField
                  control={form.control}
                  name="referralParam"
                  label="Referral Parameter"
                  placeholder="Referral Parameter"
                  options={[
                    { value: "ref", label: "ref" },
                    { value: "via", label: "via" },
                    { value: "aff", label: "aff" },
                  ]}
                  icon={Link2}
                  affiliate={false}
                />
                <div className="flex justify-start">
                  <LogoUpload
                    value={form.watch("logoUrl") || null}
                    onChange={(url) => form.setValue("logoUrl", url || "")}
                    affiliate={false}
                    orgId={orgData.id}
                    orgName={orgData.name}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking and Commission Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking and Commission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSection title="Cookie Lifetime Settings" borderTop>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    control={form.control}
                    name="cookieLifetimeValue"
                    label="Cookie Lifetime"
                    placeholder="Cookie Lifetime"
                    type="number"
                    icon={Clock}
                    affiliate={false}
                  />
                  <SelectField
                    control={form.control}
                    name="cookieLifetimeUnit"
                    label="Cookie Lifetime Unit"
                    placeholder="Cookie Lifetime Unit"
                    options={[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                      { value: "year", label: "Year" },
                    ]}
                    icon={Calendar}
                    affiliate={false}
                  />
                </div>
              </FormSection>
              <FormSection title="Commission Settings" borderTop>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    control={form.control}
                    name="commissionType"
                    label="Commission Type"
                    placeholder="Commission Type"
                    options={[
                      { value: "percentage", label: "Percentage" },
                      { value: "fixed", label: "Fixed" },
                    ]}
                    icon={Coins}
                    affiliate={false}
                  />
                  <InputField
                    control={form.control}
                    name="commissionValue"
                    label="Commission Value"
                    placeholder="Commission Value"
                    type="number"
                    icon={
                      form.watch("commissionType") === "percentage"
                        ? Percent
                        : BadgeDollarSign
                    }
                    affiliate={false}
                  />
                </div>
              </FormSection>
              <FormSection title="Commission Duration" borderTop borderBottom>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    control={form.control}
                    name="commissionDurationValue"
                    label="Commission Duration"
                    placeholder="Commission Duration"
                    type="number"
                    icon={Calendar}
                    affiliate={false}
                  />
                  <SelectField
                    control={form.control}
                    name="commissionDurationUnit"
                    label="Duration Unit"
                    placeholder="Duration Unit"
                    options={[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                      { value: "year", label: "Year" },
                    ]}
                    icon={Calendar}
                    affiliate={false}
                  />
                </div>
              </FormSection>

              <SelectField
                control={form.control}
                name="currency"
                label="Currency"
                placeholder="Currency"
                options={[
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                  { value: "GBP", label: "GBP" },
                  { value: "CAD", label: "CAD" },
                  { value: "AUD", label: "AUD" },
                ]}
                icon={BadgeDollarSign}
                affiliate={false}
              />

              <div className="flex flex-col xl:grid xl:grid-cols-2 gap-4 xl:items-center">
                <DomainInputField
                  control={form.control}
                  form={form}
                  onDomainTypeChange={setDomainType}
                />

                <div className="flex w-full xl:w-auto">
                  <Button
                    type="button"
                    disabled={
                      !domainType ||
                      domainType === "platform" ||
                      !domainChanged ||
                      isVerified
                    }
                    className="w-full xl:w-auto"
                    onClick={() => setOpen(true)}
                  >
                    {checkLabel}
                  </Button>
                </div>
              </div>
              <CardFooter className="flex justify-end px-0">
                <Button
                  type="submit"
                  disabled={
                    mut.isPending ||
                    isFormUnchanged ||
                    (onlyDomainChanged &&
                      domainType !== "platform" &&
                      !isVerified)
                  }
                >
                  {mut.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
              <AppDialog
                open={open}
                onOpenChange={setOpen}
                title={
                  domainType === "custom-main"
                    ? "Verify Custom Domain (A Record)"
                    : "Verify Custom Subdomain (CNAME)"
                }
                confirmText={
                  domainType === "custom-main"
                    ? "Verify Domain"
                    : "Verify Subdomain"
                }
                confirmLoading={verifyMut.isPending}
                onConfirm={() => verifyMut.mutate()}
                affiliate={false}
              >
                {domainType === "custom-main" ? (
                  <p className="text-sm text-muted-foreground">
                    Please add an <strong>A record</strong> pointing your domain
                    to <code>123.45.67.89</code> in your DNS provider. Once
                    added, click <strong>Verify Domain</strong> to confirm.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Please add a <strong>CNAME record</strong> pointing your
                    subdomain to <code>cname.refearnapp.com</code> in your DNS
                    provider. Once added, click{" "}
                    <strong>Verify Subdomain</strong> to confirm.
                  </p>
                )}
              </AppDialog>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
