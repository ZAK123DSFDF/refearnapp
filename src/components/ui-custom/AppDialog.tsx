// components/ui/AppDialog.tsx
"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAtomValue } from "jotai"
import { buttonCustomizationAtom } from "@/store/AuthCustomizationAtom"

interface AppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children?: React.ReactNode // 👈 accepts any JSX element
  footer?: React.ReactNode // 👈 optional footer override
  confirmText?: string
  confirmLoading?: boolean
  onConfirm?: () => void
  affiliate: boolean
  showFooter?: boolean
  hideCloseIcon?: boolean
}

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  confirmText = "OK",
  confirmLoading = false,
  onConfirm,
  affiliate = false,
  showFooter = true,
  hideCloseIcon = false,
}: AppDialogProps) {
  const {
    buttonDisabledTextColor,
    buttonBackgroundColor,
    buttonDisabledBackgroundColor,
    buttonTextColor,
  } = useAtomValue(buttonCustomizationAtom)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        affiliate={affiliate}
        hideCloseIcon={hideCloseIcon}
        className="max-w-2xl"
      >
        {title || description ? (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        ) : (
          // 👇 Provide a hidden title for accessibility

          <DialogTitle className="sr-only">Dialog</DialogTitle>
        )}

        {/* 👇 Render injected component */}
        <div className="py-4">{children}</div>

        {showFooter && (
          <DialogFooter>
            {footer ?? (
              <Button
                onClick={() => {
                  onConfirm?.()
                }}
                disabled={confirmLoading}
                style={{
                  backgroundColor: confirmLoading
                    ? (affiliate && buttonDisabledBackgroundColor) || undefined
                    : (affiliate && buttonBackgroundColor) || undefined,
                  color: confirmLoading
                    ? (affiliate && buttonDisabledTextColor) || undefined
                    : (affiliate && buttonTextColor) || undefined,
                }}
              >
                {confirmLoading && (
                  <Loader2
                    style={{
                      color:
                        (affiliate && buttonDisabledTextColor) || undefined,
                    }}
                    className="w-4 h-4 mr-2 animate-spin"
                  />
                )}
                {confirmText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
