"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableView } from "@/components/ui-custom/TableView"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { useAppMutation } from "@/hooks/useAppMutation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import {
  inviteTeamMember,
  toggleTeamStatus,
  deleteTeamMember,
} from "@/app/(organization)/organization/[orgId]/dashboard/teams/action"
import { InputField, TextareaField } from "@/components/Auth/FormFields"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import { useAppQuery } from "@/hooks/useAppQuery"
import { TeamsColumns } from "@/components/pages/Dashboard/Teams/TeamsColumns"
import { TableTop } from "@/components/ui-custom/TableTop"
import PaginationControls from "@/components/ui-custom/PaginationControls"
import { useQueryClient } from "@tanstack/react-query"
import { PlanInfo } from "@/lib/types/organization/planInfo"
import { useRouter } from "next/navigation"
import { handlePlanRedirect } from "@/util/HandlePlanRedirect"
import { api } from "@/lib/apiClient"
import { useAppTable } from "@/hooks/useAppTable"

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
})

export default function Teams({
  orgId,
  affiliate = false,
  plan,
}: {
  orgId: string
  affiliate: boolean
  plan: PlanInfo
}) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    id: string | null
  }>({
    open: false,
    id: null,
  })
  const [toggleDialog, setToggleDialog] = useState<{
    open: boolean
    id: string | null
    active: boolean
  }>({ open: false, id: null, active: false })
  const [openInvite, setOpenInvite] = useState(false)
  const [upgradeDialog, setUpgradeDialog] = useState(false)
  const queryClient = useQueryClient()
  const { filters, setFilters } = useQueryFilter()
  const router = useRouter()
  // Fetch teams
  const {
    data: searchData,
    error: searchError,
    isPending: searchPending,
  } = useAppQuery(
    ["org-teams", orgId, filters.offset, filters.email],
    (id, query) => api.organization.dashboard.teams([id, query]),
    [orgId, { offset: filters.offset, email: filters.email }] as const,
    { enabled: !!orgId }
  )
  // Invite mutation
  const inviteMutation = useAppMutation(inviteTeamMember, {
    onSuccess: (res) => {
      if (res.ok) {
        setOpenInvite(false)
        form.reset()
      }
    },
  })

  // Activate/deactivate mutation
  const toggleMutation = useAppMutation(toggleTeamStatus, {
    onSuccess: (_, variables) => {
      queryClient
        .invalidateQueries({
          queryKey: ["org-teams", variables.orgId],
        })
        .then(() => console.log("Invalidated teams query"))
    },
  })

  // Delete mutation
  const deleteMutation = useAppMutation(deleteTeamMember, {
    onSuccess: (_, variables) => {
      setDeleteDialog({ open: false, id: null })
      queryClient
        .invalidateQueries({
          queryKey: ["org-teams", variables.orgId],
        })
        .then(() => console.log("Invalidated teams query"))
    },
  })

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", title: "", description: "" },
  })

  const onSubmit = (data: z.infer<typeof inviteSchema>) => {
    inviteMutation.mutate({ ...data, orgId })
  }
  const confirmDelete = () => {
    if (deleteDialog.id) deleteMutation.mutate({ id: deleteDialog.id, orgId })
  }
  const confirmToggle = () => {
    if (toggleDialog.id) {
      toggleMutation.mutate({
        id: toggleDialog.id,
        active: !toggleDialog.active,
        orgId,
      })
      setToggleDialog({ open: false, id: null, active: false })
    }
  }
  const columns = useMemo(
    () =>
      TeamsColumns({
        onToggle: (id, active) => setToggleDialog({ open: true, id, active }),
        onDelete: (id) => setDeleteDialog({ open: true, id }),
      }),
    []
  )
  const tableData = searchData?.rows ?? []
  const hasNext = searchData?.hasNext ?? false
  const teamCount = tableData.length
  const { table } = useAppTable({
    data: tableData,
    columns,
    manualFiltering: true,
    manualPagination: true,
  })
  const handleInviteClick = () => {
    // 🧠 Block FREE plan users completely
    if (plan.plan === "FREE") {
      setUpgradeDialog(true)
      return
    }

    // 🧠 Block EXPIRED plans (PRO or ULTIMATE)
    if (plan.type === "EXPIRED") {
      setUpgradeDialog(true)
      return
    }

    // 🧠 PRO plan: limit team members
    if (plan.plan === "PRO" && teamCount >= 3) {
      setUpgradeDialog(true)
      return
    }

    // ✅ Otherwise open the invite dialog
    setOpenInvite(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage your teams and invitations
          </p>
        </div>
        <Button onClick={handleInviteClick}>Invite Member</Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <TableTop
            table={table}
            filters={{ email: filters.email }}
            onOrderChange={() => {}}
            onEmailChange={(email) => setFilters({ email: email || undefined })}
            affiliate={affiliate}
            hideOrder
          />
          <TableView
            isPending={searchPending}
            error={searchError}
            table={table}
            columns={columns}
            affiliate={affiliate}
            isPreview={false}
            tableEmptyText="No team members found."
          />
          <PaginationControls
            offset={filters.offset}
            hasNext={hasNext}
            tableDataLength={tableData.length}
            setFilters={setFilters}
          />
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <AppDialog
        open={openInvite}
        onOpenChange={setOpenInvite}
        title="Invite a Team Member"
        description="Send an invitation email to add a new member to your organization."
        confirmText="Send Invite"
        confirmLoading={inviteMutation.isPending}
        onConfirm={form.handleSubmit(onSubmit)}
        affiliate={affiliate}
      >
        <Form {...form}>
          <form className="space-y-4">
            <InputField
              control={form.control}
              name="email"
              label="Email"
              placeholder="user@example.com"
              type="email"
              affiliate={affiliate}
            />

            <InputField
              control={form.control}
              name="title"
              label="Title"
              placeholder="Invitation title"
              type="text"
              affiliate={affiliate}
            />

            <TextareaField
              control={form.control}
              name="description"
              label="Message"
              placeholder="Write your invitation message..."
              rows={4}
              affiliate={affiliate}
            />
          </form>
        </Form>
      </AppDialog>
      <AppDialog
        open={upgradeDialog}
        onOpenChange={setUpgradeDialog}
        title={
          plan.type === "EXPIRED"
            ? "Plan Expired"
            : plan.type === "PURCHASE"
              ? "Purchase Ultimate Bundle"
              : plan.plan === "FREE"
                ? "Upgrade Required"
                : "Upgrade Required"
        }
        description={
          plan.type === "EXPIRED"
            ? `Your ${plan.plan} plan has expired. Please renew to continue accessing team management features.`
            : plan.type === "PURCHASE"
              ? "Your Pro bundle allows up to 3 team members. Purchase the Ultimate bundle to add more."
              : plan.plan === "FREE"
                ? "You need to upgrade or purchase a plan to access team management."
                : "Your Pro plan allows up to 3 team members. Upgrade to Ultimate to add more."
        }
        confirmText={
          plan.type === "EXPIRED"
            ? "Renew Now"
            : plan.type === "PURCHASE"
              ? "Purchase Ultimate Bundle"
              : plan.plan === "FREE"
                ? "View Pricing"
                : "Upgrade Now"
        }
        onConfirm={() => {
          setUpgradeDialog(false)
          setTimeout(() => handlePlanRedirect(orgId, router), 150)
        }}
        affiliate={affiliate}
      >
        <p className="text-sm text-muted-foreground">
          {plan.type === "EXPIRED"
            ? `Your ${plan.plan} plan has expired. Renew to continue managing your teams.`
            : plan.type === "PURCHASE"
              ? "Unlock unlimited team members and advanced features by purchasing the Ultimate bundle."
              : plan.plan === "FREE"
                ? "Upgrade your plan to access Teams and invite members to your organization."
                : "Upgrade to Ultimate to unlock unlimited team members and advanced tools."}
        </p>
      </AppDialog>

      {/* Delete Confirmation Dialog */}
      <AppDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, id: open ? deleteDialog.id : null })
        }
        title="Delete Team Member"
        description="Are you sure you want to delete this team member? This action cannot be undone."
        confirmText="Yes, Delete"
        confirmLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        affiliate={affiliate}
      >
        <p className="text-sm text-muted-foreground">
          Deleting a member will permanently remove their access.
        </p>
      </AppDialog>
      <AppDialog
        open={toggleDialog.open}
        onOpenChange={(open) =>
          setToggleDialog({
            open,
            id: open ? toggleDialog.id : null,
            active: false,
          })
        }
        title={
          toggleDialog.active
            ? "Deactivate Team Member"
            : "Activate Team Member"
        }
        description={
          toggleDialog.active
            ? "Are you sure you want to deactivate this team member?"
            : "Are you sure you want to activate this team member?"
        }
        confirmText={toggleDialog.active ? "Yes, Deactivate" : "Yes, Activate"}
        confirmLoading={toggleMutation.isPending}
        onConfirm={confirmToggle}
        affiliate={affiliate}
      >
        <p className="text-sm text-muted-foreground">
          This will immediately {toggleDialog.active ? "disable" : "enable"} the
          member’s access.
        </p>
      </AppDialog>
    </div>
  )
}
