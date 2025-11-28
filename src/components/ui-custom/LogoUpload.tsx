"use client"

import { useRef, useState } from "react"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAtomValue } from "jotai"

import {
  deleteOrganizationLogo,
  updateOrganizationLogo,
} from "@/app/(organization)/(auth)/create-company/action"
import { FileUploadRef } from "@/components/ui-custom/FileUploadRef"
import { uploadsAtom } from "@/store/UploadAtom"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { SingleUploadProgress } from "@/components/ui-custom/SingleUploadProgress"
import { AppResponse, useAppMutation } from "@/hooks/useAppMutation"
import { cn } from "@/lib/utils"
type LogoUploadProps = {
  value: string | null
  onChange: (url: string | null) => void
  affiliate: boolean
  orgId?: string
  orgName?: string
  mode?: "default" | "avatar"
  field?: "logoUrl" | "openGraphUrl"
  className?: string
  uploadId?: string
  sharp?: boolean
  uploadButtonLabel?: string
  dialogTitle?: string
  dialogDescription?: string
}

export function LogoUpload({
  value,
  onChange,
  affiliate,
  orgId,
  orgName,
  mode = "default",
  field = "logoUrl",
  className,
  uploadId = "company-logo",
  sharp = false,
  uploadButtonLabel,
  dialogTitle = "Uploading Logo",
  dialogDescription = "Please wait while your logo is uploading…",
}: LogoUploadProps) {
  const fileUploadRef = useRef<FileUploadRef>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const uploads = useAtomValue(uploadsAtom)

  const deleteLogoMutation = useAppMutation<AppResponse, void>(
    async () => {
      await deleteOrganizationLogo(value!)
      if (orgId) {
        await updateOrganizationLogo({ orgId, field, value: null })
      }
      return {
        ok: true,
        message: "Logo deleted successfully.",
      }
    },
    {
      onSuccess: () => {
        onChange(null)
      },
    }
  )

  const handleButtonClick = () => {
    fileUploadRef.current?.openFilePicker()
  }

  const handleNewLogo = async (newUrl: string) => {
    const oldUrl = value
    onChange(newUrl)
    if (oldUrl) {
      deleteOrganizationLogo(oldUrl).catch((err) =>
        console.error("Failed to clean up old logo:", err)
      )
    }

    if (orgId) {
      try {
        await updateOrganizationLogo({ orgId, field, value: newUrl })
      } catch (err) {
        console.error("Failed to save logo to DB:", err)
      }
    }
    setTimeout(() => setDialogOpen(false), 600)
  }

  const files = uploads[uploadId]?.files ?? []
  const latestFile = files.length > 0 ? files[files.length - 1] : null
  const errorMessage = uploads[uploadId]?.errorMessage ?? null

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        {value ? (
          field === "logoUrl" ? (
            <img
              src={value}
              alt="Company Logo"
              className={`h-[35px] w-[35px] rounded-xl object-contain bg-muted ${
                mode === "avatar" ? "cursor-default" : "cursor-pointer"
              }`}
              onClick={mode === "default" ? handleButtonClick : undefined}
            />
          ) : (
            <img
              src={value}
              alt="Company Logo"
              className={cn(
                className,
                "object-contain bg-muted",
                mode === "avatar" ? "cursor-default" : "cursor-pointer"
              )}
              onClick={mode === "default" ? handleButtonClick : undefined}
            />
          )
        ) : field === "logoUrl" ? (
          <div
            className="h-[35px] w-[35px] rounded-xl flex items-center text-[25px] justify-center font-bold text-white"
            style={{
              backgroundImage:
                "linear-gradient(to bottom right, #A5C8FF, #7B87FF, #6A4CFF)",
            }}
          >
            {orgName?.charAt(0).toUpperCase() ?? "?"}
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center justify-center border-2 border-dashed border-muted-foreground/40 text-muted-foreground text-sm",
              className
            )}
          >
            No image
          </div>
        )}

        {/* ❌ only show delete button in default mode */}
        {mode === "default" && value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              deleteLogoMutation.mutate()
            }}
            disabled={deleteLogoMutation.isPending}
            className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 hover:bg-red-100"
          >
            {deleteLogoMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
          </button>
        )}
      </div>

      {/* Upload/Change button only in default mode */}
      {mode === "default" && (
        <Button type="button" variant="outline" onClick={handleButtonClick}>
          {uploadButtonLabel
            ? value
              ? `Change ${uploadButtonLabel}`
              : `Upload ${uploadButtonLabel}`
            : value
              ? "Change Logo"
              : "Upload Logo"}
        </Button>
      )}

      {/* Hidden uploader */}
      <div className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
        <FileUploadRef
          ref={fileUploadRef}
          uploadId={uploadId}
          type="image"
          affiliate={affiliate}
          maxFiles={1}
          field={field}
          sharp={sharp}
          onFileSelected={() => setDialogOpen(true)}
          onUploadSuccess={(_, __, ___, url) => {
            handleNewLogo(url).then(() =>
              console.log("Logo updated successfully")
            )
          }}
        />
      </div>

      <AppDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        description={dialogDescription}
        affiliate={affiliate}
        showFooter={false}
      >
        {latestFile && (
          <SingleUploadProgress file={latestFile} errorMessage={errorMessage} />
        )}
      </AppDialog>
    </div>
  )
}
