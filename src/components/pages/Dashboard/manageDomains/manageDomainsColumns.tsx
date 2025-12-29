"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Power, PowerOff, Trash2, Star, ArrowRightLeft } from "lucide-react"
import { DomainRow } from "@/lib/types/domainRow"

export const manageDomainsColumns = ({
  onToggleActive,
  onMakePrimary,
  onToggleRedirect,
  onDelete,
}: {
  onToggleActive: (id: string, isActive: boolean) => void
  onMakePrimary: (id: string) => void
  onToggleRedirect: (id: string, isRedirect: boolean) => void
  onDelete: (id: string) => void
}): ColumnDef<DomainRow>[] => [
  /* ---------------- Domain ---------------- */
  {
    accessorKey: "domainName",
    header: "Domain",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.domainName}</div>
    ),
  },

  /* ---------------- DNS ---------------- */
  {
    accessorKey: "dnsStatus",
    header: "DNS",
    cell: ({ row }) => {
      const { dnsStatus, isVerified } = row.original

      let label = ""
      let classes = "px-2 py-1 rounded-full text-xs border-2"

      if (!isVerified && dnsStatus === "Pending") {
        label = "Pending"
        classes += " border-gray-400 text-gray-600 bg-gray-50"
      } else if (!isVerified && dnsStatus === "Failed") {
        label = "Failed"
        classes += " border-red-500 text-red-600 bg-red-50"
      } else if (isVerified && dnsStatus === "Verified") {
        label = "Valid"
        classes += " border-green-500 text-green-600 bg-green-50"
      } else {
        label = "Broken"
        classes += " border-yellow-500 text-yellow-600 bg-yellow-50"
      }

      return (
        <Badge variant="outline" className={classes}>
          {label}
        </Badge>
      )
    },
  },

  /* ---------------- Status ---------------- */
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const { isActive } = row.original

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

  /* ---------------- Role ---------------- */
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const { isPrimary, isRedirect } = row.original

      if (isPrimary) {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-400">
            Primary
          </Badge>
        )
      }

      if (isRedirect) {
        return (
          <Badge className="bg-purple-100 text-purple-800 border border-purple-400">
            Redirect
          </Badge>
        )
      }

      return (
        <Badge variant="outline" className="text-gray-600">
          —
        </Badge>
      )
    },
  },

  /* ---------------- Actions ---------------- */
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { id, isActive, isPrimary, isRedirect, dnsStatus, isVerified } =
        row.original

      const canDelete = !isActive && (!isVerified || dnsStatus !== "Verified")

      return (
        <div className="flex flex-wrap gap-2">
          {/* Activate / Deactivate */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(id, isActive)}
          >
            {isActive ? (
              <>
                <PowerOff className="w-4 h-4 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-1" />
                Activate
              </>
            )}
          </Button>

          {/* Make Primary */}
          <Button
            variant="outline"
            size="sm"
            disabled={!isActive || isPrimary}
            onClick={() => onMakePrimary(id)}
          >
            <Star className="w-4 h-4 mr-1" />
            {isPrimary ? "Primary" : "Make Primary"}
          </Button>

          {/* Redirect */}
          <Button
            variant="outline"
            size="sm"
            disabled={!isActive || isPrimary}
            onClick={() => onToggleRedirect(id, isRedirect)}
          >
            <ArrowRightLeft className="w-4 h-4 mr-1" />
            {isRedirect ? "Disable Redirect" : "Redirect"}
          </Button>

          {/* Delete */}
          <Button
            variant="destructive"
            size="sm"
            disabled={!canDelete}
            onClick={() => onDelete(id)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      )
    },
  },
]
