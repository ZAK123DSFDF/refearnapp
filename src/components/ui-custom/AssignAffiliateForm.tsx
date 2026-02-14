"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form } from "@/components/ui/form"
import { Percent, DollarSign, Calendar, User, Clock } from "lucide-react"
import { SelectField } from "@/components/ui-custom/SelectFields"
import { InputField } from "@/components/Auth/FormFields"

const assignSchema = z.object({
  affiliateId: z.string().min(1, "Please select an affiliate"),
  commissionType: z.enum(["PERCENTAGE", "FLAT_FEE"]),
  commissionValue: z.string().min(1, "Required"),
  durationValue: z.string().min(1, "Required"),
  durationUnit: z.enum(["day", "week", "month", "year"]),
})

type AssignFormValues = z.infer<typeof assignSchema>

export function AssignAffiliateForm() {
  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      affiliateId: "",
      commissionType: "PERCENTAGE",
      commissionValue: "20",
      durationValue: "12",
      durationUnit: "month",
    },
  })

  const commissionType = form.watch("commissionType")

  return (
    <Form {...form}>
      <form className="space-y-6">
        <SelectField
          control={form.control}
          name="affiliateId"
          label="Select Affiliate"
          placeholder="Choose an affiliate..."
          affiliate={false}
          icon={User}
          options={[
            { value: "aff_1", label: "John Doe (john@example.com)" },
            { value: "aff_2", label: "Jane Smith (jane@design.com)" },
          ]}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            control={form.control}
            name="commissionType"
            label="Commission Type"
            affiliate={false}
            icon={commissionType === "PERCENTAGE" ? Percent : DollarSign}
            options={[
              { value: "PERCENTAGE", label: "Percentage (%)" },
              { value: "FLAT_FEE", label: "Flat Fee ($)" },
            ]}
          />
          <InputField
            control={form.control}
            name="commissionValue"
            label="Commission Value"
            type="number"
            placeholder="20"
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
              type="number"
              placeholder="12"
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
          <p className="mt-2 text-xs text-muted-foreground">
            Once a customer uses this code, their commission will expire after
            this period.
          </p>
        </div>
      </form>
    </Form>
  )
}
