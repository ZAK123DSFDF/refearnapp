"use client"
import React from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function SimulationInfoCard({
  errorMessage,
  successMessage,
  className,
}: {
  errorMessage: React.ReactNode
  successMessage: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("border-dashed shadow-md bg-muted/40", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="px-2 py-0.5">Preview Mode</Badge>
            <h3 className="font-medium text-sm">Simulation Info</h3>
          </div>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span>{errorMessage}</span>
        </p>

        <p className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>{successMessage}</span>
        </p>
      </CardContent>
    </Card>
  )
}
