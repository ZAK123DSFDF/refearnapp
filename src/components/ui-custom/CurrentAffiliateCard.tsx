"use client"

import React from "react"
import { User, Mail, Link2Off, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CurrentAffiliateCardProps {
  affiliate?: {
    name?: string
    email?: string
  }
  onUnlink?: () => void
  isPending?: boolean
}

export function CurrentAffiliateCard({
  affiliate,
  onUnlink,
  isPending,
}: CurrentAffiliateCardProps) {
  const isAssigned = !!affiliate?.name

  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-background p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Currently Assigned To
        </h4>
        {isAssigned && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onUnlink}
            disabled={isPending}
            className="h-6 rounded-full px-2.5 text-[10px] font-bold gap-1 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-none transition-all"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Link2Off className="h-3 w-3" />
            )}
            {isPending ? "Unlinking..." : "Unlink"}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground truncate">
            {affiliate?.name || "No Affiliate Linked"}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <Mail className="h-3 w-3" />
            <span className="truncate">
              {affiliate?.email || "Connect an affiliate to track conversions"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
