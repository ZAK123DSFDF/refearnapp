"use client"
import React, { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { InputField, TextareaField } from "@/components/Auth/FormFields"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { sendTeamSupportMessage } from "@/app/(organization)/organization/[orgId]/teams/dashboard/supportEmail/action"
import { sendSupportMessage } from "@/app/(organization)/organization/[orgId]/dashboard/supportEmail/action"
import { useAppMutation } from "@/hooks/useAppMutation"
import { Loader2, Mail, MessageSquare, LifeBuoy } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const supportSchema = z.object({
  header: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Message is required"),
})

type FormValues = z.infer<typeof supportSchema>

type SupportEmailProps = {
  affiliate: boolean
  isTeam?: boolean
  orgId: string
}

const SupportEmail = ({
  affiliate,
  isTeam = false,
  orgId,
}: SupportEmailProps) => {
  const [tab, setTab] = useState<"feedback" | "support">("feedback")

  const feedbackForm = useForm<FormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: { header: "", description: "" },
  })

  const supportForm = useForm<FormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: { header: "", description: "" },
  })

  const sendMessage = isTeam ? sendTeamSupportMessage : sendSupportMessage

  const sendMutation = useAppMutation(sendMessage, {
    affiliate,
    onSuccess: () => {
      if (tab === "feedback") feedbackForm.reset()
      if (tab === "support") supportForm.reset()
    },
  })

  const onSubmit = (values: FormValues) => {
    const payload = {
      type: tab.toUpperCase() as "FEEDBACK" | "SUPPORT",
      subject:
        values.header ||
        (tab === "feedback" ? "Feedback Request" : "Support Request"),
      message: values.description,
      orgId,
    }
    sendMutation.mutate(payload)
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-blue-100 text-blue-600">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">How can we help?</h1>
        <p className="text-slate-500 mt-2">
          We'd love to hear from you. Send us a message below.
        </p>
      </div>

      <Card className="border-slate-200 shadow-xl shadow-blue-500/5 overflow-hidden">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "feedback" | "support")}
          className="w-full"
        >
          <div className="bg-slate-50/50 border-b border-slate-100 p-2">
            <TabsList className="grid w-full grid-cols-2 bg-slate-200/50">
              <TabsTrigger
                value="feedback"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Feedback
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <LifeBuoy className="w-4 h-4 mr-2" />
                Support
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-6 pt-8">
            <TabsContent value="feedback" className="mt-0 focus-visible:ring-0">
              <Form {...feedbackForm}>
                <form
                  onSubmit={feedbackForm.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <InputField
                    control={feedbackForm.control}
                    name="header"
                    type="text"
                    label="Subject"
                    placeholder="What's this feedback about?"
                    affiliate={affiliate}
                  />
                  <TextareaField
                    control={feedbackForm.control}
                    name="description"
                    label="Your Feedback"
                    placeholder="Tell us what you think..."
                    affiliate={affiliate}
                    rows={6}
                  />
                  <Button
                    type="submit"
                    disabled={sendMutation.isPending && tab === "feedback"}
                    className="w-full bg-primary text-primary-foreground font-semibold py-6 shadow-lg shadow-blue-200"
                  >
                    {sendMutation.isPending && tab === "feedback" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      "Send Feedback Message"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="support" className="mt-0 focus-visible:ring-0">
              <Form {...supportForm}>
                <form
                  onSubmit={supportForm.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <InputField
                    control={supportForm.control}
                    name="header"
                    type="text"
                    label="Issue Subject"
                    placeholder="Briefly describe the issue"
                    affiliate={affiliate}
                  />
                  <TextareaField
                    control={supportForm.control}
                    name="description"
                    label="Description"
                    placeholder="Please provide details about your request..."
                    affiliate={affiliate}
                    rows={6}
                  />
                  <Button
                    type="submit"
                    disabled={sendMutation.isPending && tab === "support"}
                    className="w-full bg-primary text-primary-foreground font-semibold py-6 shadow-lg shadow-blue-200"
                  >
                    {sendMutation.isPending && tab === "support" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      "Submit Support Ticket"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <p className="text-center text-xs text-slate-400 mt-6">
        Typical response time: Under 24 hours
      </p>
    </div>
  )
}

export default SupportEmail
