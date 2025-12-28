"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Power, PowerOff, Trash2 } from "lucide-react"
import { DomainRow } from "@/lib/types/domainRow"

export const manageDomainsColumns = ({
  onToggle,
  onDelete,
}: {
  onToggle: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
}): ColumnDef<DomainRow>[] => [
  {
    accessorKey: "domainName",
    header: "Domain",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.getValue("domainName")}</div>
    ),
  },
  {
    accessorKey: "dnsStatus",
    header: "DNS",
    cell: ({ row }) => {
      const { dnsStatus, isVerified } = row.original

      let label = ""
      let colorClasses = "px-2 py-1 rounded-full text-xs border-2"

      if (!isVerified && dnsStatus === "Pending") {
        label = "Pending"
        colorClasses += " border-gray-400 text-gray-600 bg-gray-50"
      } else if (!isVerified && dnsStatus === "Failed") {
        label = "Failed to verify"
        colorClasses += " border-red-500 text-red-600 bg-red-50"
      } else if (isVerified && dnsStatus === "Verified") {
        label = "Valid"
        colorClasses += " border-green-500 text-green-600 bg-green-50"
      } else if (isVerified && dnsStatus === "Failed") {
        label = "Broken"
        colorClasses += " border-yellow-500 text-yellow-600 bg-yellow-50"
      }

      return (
        <Badge variant="outline" className={colorClasses}>
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge
          variant="outline"
          className={`px-2 py-1 rounded-full text-xs border-2 ${
            isActive
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-gray-400 text-gray-600 bg-gray-50"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { id, isActive, dnsStatus, isVerified } = row.original
      const canDelete = !isActive && (!isVerified || dnsStatus !== "Verified")
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(id, isActive)}
          >
            {isActive ? (
              <>
                <PowerOff className="w-4 h-4 mr-1" /> Deactivate
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-1" /> Activate
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            disabled={!canDelete}
            onClick={() => onDelete(id)}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      )
    },
  },
]
