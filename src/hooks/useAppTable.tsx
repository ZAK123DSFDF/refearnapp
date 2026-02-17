import { useState, useMemo } from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"

interface UseAppTableOptions<TData> {
  data: TData[]
  columns: any[]
  // Configuration Flags - Now defaulting to false (Opt-in)
  manualPagination?: boolean
  manualFiltering?: boolean
  manualSorting?: boolean
  initialVisibility?: VisibilityState
}

export function useAppTable<TData>({
  data,
  columns,
  manualPagination = false, // Default: Local pagination
  manualFiltering = false, // Default: Local filtering
  manualSorting = false, // Default: Local sorting
  initialVisibility = {},
}: UseAppTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  // Merge defaults: Hide 'id' by default, but allow override via initialVisibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    ...initialVisibility,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // Handlers
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    // Core Models
    getCoreRowModel: getCoreRowModel(),

    // Client-side models
    // (Note: TanStack is smart enough to ignore these if manual flags are true)
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    // Manual flags
    manualPagination,
    manualFiltering,
    manualSorting,
  })

  return {
    table,
    columnVisibility,
    setColumnVisibility,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  }
}
