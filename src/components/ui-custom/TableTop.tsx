import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Settings2 } from "lucide-react"
import * as React from "react"
import { Table as ReactTable } from "@tanstack/react-table"
import { OrderDir, OrderBy } from "@/lib/types/orderTypes"
import OrderSelect from "@/components/ui-custom/OrderSelect"
import { SearchInput } from "@/components/ui-custom/SearchInput"

type TableProps<TData> = {
  table: ReactTable<TData>
  filters: { orderBy?: OrderBy; orderDir?: OrderDir; email?: string }
  onOrderChange: (orderBy?: OrderBy, orderDir?: OrderDir) => void
  onEmailChange: (email: string) => void
  affiliate: boolean
  mode?: "default" | "top"
  hideOrder?: boolean
  placeholder?: string
}

export const TableTop = <TData,>({
  table,
  filters,
  onOrderChange,
  onEmailChange,
  affiliate,
  mode = "default",
  hideOrder = false,
  placeholder = "Filter emails...",
}: TableProps<TData>) => {
  const iconHiddenAt = hideOrder ? "md:hidden" : "lg:hidden"
  const textVisibleAt = hideOrder ? "hidden md:flex" : "hidden lg:flex"

  return (
    <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      {hideOrder ? (
        <div className="flex items-center gap-2 md:justify-between md:w-full">
          <SearchInput
            value={filters.email ?? ""}
            onChange={onEmailChange}
            placeholder={placeholder}
            className="w-full md:w-[240px]"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="px-2 lg:px-4">
                <Settings2 className={`h-4 w-4 ${iconHiddenAt}`} />
                <div className={`${textVisibleAt} items-center gap-2`}>
                  Columns <ChevronDown className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value)}
                    className="capitalize"
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <>
          <SearchInput
            value={filters.email ?? ""}
            onChange={onEmailChange}
            placeholder="Filter emails..."
            className="w-full md:w-[240px]"
          />

          <div className="flex items-center gap-2">
            <OrderSelect
              value={filters}
              onChange={onOrderChange}
              affiliate={affiliate}
              mode={mode}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="px-2 lg:px-4">
                  <Settings2 className={`h-4 w-4 ${iconHiddenAt}`} />
                  <div className={`${textVisibleAt} items-center gap-2`}>
                    Columns <ChevronDown className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(value)
                      }
                      className="capitalize"
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  )
}
