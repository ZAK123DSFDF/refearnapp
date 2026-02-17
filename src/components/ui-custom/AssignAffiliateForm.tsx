"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import deepEqual from "fast-deep-equal" // Import deepEqual
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button" // Shadcn button
import {
  Percent,
  DollarSign,
  Calendar,
  Clock,
  Loader2,
  Save,
} from "lucide-react"
import { SelectField } from "@/components/ui-custom/SelectFields"
import { InputField } from "@/components/Auth/FormFields"
import { api } from "@/lib/apiClient"
import { useAppQuery } from "@/hooks/useAppQuery"
import { CurrentAffiliateCard } from "@/components/ui-custom/CurrentAffiliateCard"
import { useQueryClient } from "@tanstack/react-query"
import { useAppMutation } from "@/hooks/useAppMutation"
import {
  unlinkAffiliateAction,
  updatePromotionAssignmentAction, // We will create this action next
} from "@/app/(organization)/organization/[orgId]/dashboard/coupons/action"

const assignSchema = z.object({
  affiliateId: z.string().min(1, "Please select an affiliate"),
  commissionType: z.enum(["PERCENTAGE", "FLAT_FEE"]),
  commissionValue: z.string().min(1, "Required"),
  durationValue: z.string().min(1, "Required"),
  durationUnit: z.enum(["day", "week", "month", "year"]),
})

type AssignFormValues = z.infer<typeof assignSchema>

export function AssignAffiliateForm({
  orgId,
  isTeam,
  codeId,
  settings,
  settingsLoading,
  initialAffiliate,
  onClose, // Pass this from the dialog
}: {
  orgId: string
  isTeam: boolean
  codeId: string
  settings: any
  settingsLoading: boolean
  initialAffiliate?: { id?: string; name?: string; email?: string }
  onClose?: () => void
}) {
  const [offset, setOffset] = useState(1)
  const [activeAffiliate, setActiveAffiliate] = useState(initialAffiliate)
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const queryClient = useQueryClient()
  const memoizedDefaults = useMemo(() => {
    if (!settings) return null
    const round = (val: any) => Math.round(Number(val) * 100) / 100
    return {
      affiliateId: settings.affiliateId || "",
      commissionType: settings.commissionType as "PERCENTAGE" | "FLAT_FEE",
      commissionValue: String(round(settings.commissionValue)),
      durationValue: String(settings.commissionDurationValue),
      durationUnit: settings.commissionDurationUnit as any,
    }
  }, [settings])
  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      affiliateId: settings?.affiliateId || "",
      commissionType: settings?.commissionType || "PERCENTAGE",
      commissionValue: String(settings?.commissionValue) || "20",
      durationValue: String(settings?.commissionDurationValue) || "12",
      durationUnit: settings?.commissionDurationUnit || "month",
    },
  })
  // Sync settings to form when they arrive
  useEffect(() => {
    if (memoizedDefaults) {
      form.reset(memoizedDefaults)
    }
  }, [memoizedDefaults, form])

  const currentValues = form.watch()

  // 4. Change Detection Logic
  // 4. Change Detection Logic
  const isFormUnchanged = useMemo(() => {
    if (!memoizedDefaults) return true

    // Create copies for comparison to avoid mutating the actual form state
    const normalizedCurrent = {
      ...currentValues,
      commissionValue: Number(currentValues.commissionValue),
      durationValue: Number(currentValues.durationValue),
    }

    const normalizedDefaults = {
      ...memoizedDefaults,
      commissionValue: Number(memoizedDefaults.commissionValue),
      durationValue: Number(memoizedDefaults.durationValue),
    }

    return deepEqual(normalizedCurrent, normalizedDefaults)
  }, [currentValues, memoizedDefaults])

  // 5. Unlink Mutation
  const { mutate: handleUnlink, isPending: unlinking } = useAppMutation<
    any,
    void
  >(() => unlinkAffiliateAction(orgId, codeId), {
    onSuccess: (res) => {
      if (res.ok) {
        queryClient
          .invalidateQueries({
            queryKey: [isTeam ? "team-coupons" : "org-coupons"],
          })
          .then(() => console.log("invalidated"))
        queryClient
          .invalidateQueries({
            queryKey: ["promo-settings", orgId, codeId],
          })
          .then(() => console.log("invalidated"))
        form.setValue("affiliateId", "")
      }
    },
  })
  const watchedAffiliateId = form.watch("affiliateId")
  useEffect(() => {
    if (!watchedAffiliateId) {
      setActiveAffiliate(undefined)
      return
    }
    if (watchedAffiliateId === settings?.affiliateId) {
      setActiveAffiliate(initialAffiliate)
      return
    }
    const selected = options.find((opt) => opt.value === watchedAffiliateId)
    if (selected) {
      const [name, rawEmail] = selected.label.split(" (")
      const email = rawEmail?.replace(")", "")
      setActiveAffiliate({ id: watchedAffiliateId, name, email })
    }
  }, [watchedAffiliateId, options, initialAffiliate])
  // 6. Update Assignment Mutation
  const { mutate: updateAssignment, isPending: isSaving } = useAppMutation(
    (data) => updatePromotionAssignmentAction(orgId, codeId, data),
    {
      onSuccess: (res) => {
        if (res.ok) {
          queryClient
            .invalidateQueries({
              queryKey: [isTeam ? "team-coupons" : "org-coupons"],
            })
            .then(() => console.log("invalidated"))
          queryClient
            .invalidateQueries({
              queryKey: ["promo-settings", orgId, codeId],
            })
            .then(() => console.log("invalidated"))
          onClose?.() // Close modal on success
        }
      },
    }
  )

  const onSubmit = (values: AssignFormValues) => {
    updateAssignment(values)
  }

  // --- Fetching Logic for Search ---
  const { data, isPending } = useAppQuery(
    ["affiliate-lookup", orgId, offset, isTeam],
    (id) =>
      api.organization.affiliateLookup([
        id,
        { offset, context: isTeam ? "team" : "admin" },
      ]),
    [orgId] as const,
    { enabled: !!orgId }
  )

  useEffect(() => {
    if (data?.rows) {
      const formatted = data.rows.map((a: any) => ({
        value: a.id,
        label: `${a.name} (${a.email})`,
      }))
      setOptions((prev) => (offset === 1 ? formatted : [...prev, ...formatted]))
    }
  }, [data, offset])
  const currencyCode = settings?.currency || "USD"
  if (settingsLoading)
    return (
      <div className="p-10 text-center text-sm italic">
        Fetching settings...
      </div>
    )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CurrentAffiliateCard
          affiliate={activeAffiliate}
          onUnlink={() => handleUnlink()}
          isPending={unlinking}
        />

        <div className="space-y-1">
          <SelectField
            control={form.control}
            name="affiliateId"
            label="Transfer Assignment To"
            options={options}
            hasNext={data?.hasNext}
            showDefault={false}
            onLoadMore={(e) => {
              e.preventDefault()
              setOffset((p) => p + 1)
            }}
            isLoading={isPending}
            affiliate={false}
            placeholder="Search for a different affiliate..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            control={form.control}
            name="commissionType"
            label="Commission Type"
            affiliate={false}
            icon={
              currentValues.commissionType === "PERCENTAGE"
                ? Percent
                : DollarSign
            }
            options={[
              { value: "PERCENTAGE", label: "Percentage (%)" },
              { value: "FLAT_FEE", label: `Flat Fee (${currencyCode})` },
            ]}
          />
          <InputField
            control={form.control}
            name="commissionValue"
            label={`Commission Value (${currentValues.commissionType === "PERCENTAGE" ? "%" : currencyCode})`}
            placeholder="e.g. 20 for 20% or $20"
            type="number"
            affiliate={false}
          />
        </div>

        <div className="p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium text-primary">
            <Clock className="w-4 h-4" />
            Commission Expiration Settings
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              control={form.control}
              name="durationValue"
              label="Pay Affiliate For..."
              placeholder="e.g. 12"
              type="number"
              affiliate={false}
              icon={Calendar}
            />
            <SelectField
              control={form.control}
              name="durationUnit"
              label="Unit"
              affiliate={false}
              options={[
                { value: "day", label: "Days" },
                { value: "week", label: "Weeks" },
                { value: "month", label: "Months" },
                { value: "year", label: "Years" },
              ]}
            />
          </div>
        </div>

        {/* --- Footer Buttons --- */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={isFormUnchanged || isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Assignment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
