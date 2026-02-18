import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Settings2 } from "lucide-react"
import { Table as ReactTable } from "@tanstack/react-table"
import { OrderBy, OrderDir } from "@/lib/types/analytics/orderTypes"
import OrderSelect from "@/components/ui-custom/OrderSelect"
import { SearchInput } from "@/components/ui-custom/SearchInput"
import { ReactNode } from "react"

type TableProps<TData, TOrder extends string> = {
  table: ReactTable<TData>
  filters: { orderBy?: TOrder; orderDir?: OrderDir; email?: string }
  onOrderChange: (orderBy?: TOrder, orderDir?: OrderDir) => void
  onEmailChange: (email: string) => void
  affiliate: boolean
  mode?: "default" | "top"
  hideOrder?: boolean
  placeholder?: string
  rightActions?: ReactNode
  orderOptions?: TOrder[]
}

export const TableTop = <TData, TOrder extends string>({
  table,
  filters,
  onOrderChange,
  onEmailChange,
  affiliate,
  hideOrder = false,
  placeholder = "Filter emails...",
  rightActions,
  orderOptions,
}: TableProps<TData, TOrder>) => {
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
          <div className="flex items-center gap-2">
            {rightActions}
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
        </div>
      ) : (
        <>
          <SearchInput
            value={filters.email ?? ""}
            onChange={onEmailChange}
            placeholder={placeholder}
            className="w-full md:w-[240px]"
          />

          <div className="flex items-center gap-2">
            <OrderSelect
              value={filters}
              onChange={onOrderChange}
              affiliate={affiliate}
              options={orderOptions as OrderBy[]}
            />
            {rightActions}
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
