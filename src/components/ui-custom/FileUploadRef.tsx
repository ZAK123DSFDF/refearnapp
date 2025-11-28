"use client"

import React, { useMemo, forwardRef, useImperativeHandle } from "react"
import { useDropzone } from "react-dropzone"
import {
  Dropzone,
  DropzoneEmptyState,
  DropzoneContent,
} from "@/components/ui/shadcn-io/dropzone"
import { useSetAtom } from "jotai"
import { addFileAtom, setErrorMessageAtom } from "@/store/UploadAtom"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import { validateAndUploadFile } from "@/util/FileUpload"

export interface FileUploadRef {
  openFilePicker: () => void
}
type Accept = {
  [mimeType: string]: string[]
}
export interface FileUploadProps {
  uploadId: string
  type: "csv" | "image"
  endpoint?: string
  maxFiles?: number
  maxSizeMB?: number
  path?: string
  affiliate: boolean
  preview?: boolean
  sharp?: boolean
  field?: "logoUrl" | "openGraphUrl"
  onUploadSuccess?: (
    file: File,
    fileId: string,
    uploadId: string,
    url: string
  ) => void
  onUploadError?: (file: File, err: any, uploadId: string) => void
  onFileSelected?: (file: File) => void
}

export const FileUploadRef = forwardRef<FileUploadRef, FileUploadProps>(
  (
    {
      uploadId,
      type,
      endpoint,
      maxFiles = 100,
      maxSizeMB = 5,
      path,
      sharp,
      field,
      affiliate = false,
      onUploadSuccess,
      onUploadError,
      onFileSelected,
    },
    ref
  ) => {
    const addFile = useSetAtom(addFileAtom)
    const setErrorMessage = useSetAtom(setErrorMessageAtom)
    const { showCustomToast } = useCustomToast()
    const MAX_SIZE = maxSizeMB * 1024 * 1024

    const triggerError = (msg: string) => {
      setErrorMessage(uploadId, msg)
      showCustomToast({
        type: "error",
        title: "Upload Failed",
        description: msg,
        affiliate,
      })
    }

    const handleSuccess = (
      file: File,
      fileId: string,
      uploadId: string,
      url: string
    ) => {
      onUploadSuccess?.(file, fileId, uploadId, url)
    }

    const handleFailure = (file: File, err: any, uploadId: string) => {
      if (onUploadError) onUploadError(file, err, uploadId)
      else console.error(err)
    }

    const handleDrop = (accepted: File[], fileRejections: any[]) => {
      setErrorMessage(uploadId, null)

      // Handle rejected files first
      if (fileRejections.length > 0) {
        fileRejections.forEach((rej: any) => {
          rej.errors.forEach((e: any) => {
            const msg = e.message.toLowerCase()
            if (msg.includes("too many files"))
              return triggerError(
                `You can only upload up to ${maxFiles} files.`
              )
            if (msg.includes("file too large") || msg.includes("size"))
              return triggerError(`Each file must be under ${maxSizeMB}MB.`)
            if (msg.includes("invalid") || msg.includes("type"))
              return triggerError(
                type === "csv"
                  ? "Invalid file type. Please upload CSV files."
                  : "Invalid file type. Please upload image files."
              )
          })
        })
        return
      }

      // If no rejections, handle accepted files
      if (accepted.length === 0) return

      accepted.forEach((file) => {
        onFileSelected?.(file)
        validateAndUploadFile({
          file,
          type,
          maxSizeMB,
          uploadId,
          path,
          endpoint,
          field,
          addFile,
          triggerError,
          handleSuccess,
          handleFailure,
          sharp,
        }).then(() => console.log("File processed"))
      })
    }

    const accept = useMemo((): Accept => {
      if (type === "csv") {
        return {
          "text/csv": [".csv"],
          "application/vnd.ms-excel": [".csv"],
          "application/octet-stream": [".csv"],
        }
      }
      return {
        "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      }
    }, [type])

    const { open, getInputProps, getRootProps } = useDropzone({
      noClick: true,
      noKeyboard: true,
      accept,
      maxFiles,
      maxSize: MAX_SIZE,
      onDrop: handleDrop,
    })

    useImperativeHandle(ref, () => ({
      openFilePicker: open,
    }))

    return (
      <div className="space-y-2" {...getRootProps()}>
        <input {...getInputProps()} />
        {/* Keep drag-and-drop UI hidden if you don’t want it */}
        <Dropzone accept={accept} maxFiles={maxFiles} maxSize={MAX_SIZE}>
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </div>
    )
  }
)
