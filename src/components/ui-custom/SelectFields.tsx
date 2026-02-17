"use client"

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

type SelectFieldProps = {
  control: any
  name: string
  label: string
  placeholder?: string
  options: { value: string; label: string }[]
  affiliate: boolean
  icon?: React.ElementType
  hasNext?: boolean
  onLoadMore?: (e: React.MouseEvent) => void
  isLoading?: boolean
  showDefault?: boolean
}

export const SelectField = ({
  control,
  name,
  label,
  placeholder = "Select an option",
  options,
  affiliate = false,
  icon: Icon,
  hasNext,
  onLoadMore,
  isLoading,
  showDefault = true,
}: SelectFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className={fieldState.error ? "text-destructive" : ""}>
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {Icon && (
                <Icon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
              )}
              <Select
                onValueChange={field.onChange}
                defaultValue={showDefault ? field.value : undefined}
              >
                <SelectTrigger
                  affiliate={affiliate}
                  className={`w-full border ${Icon ? "pl-10" : ""}`}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent affiliate={affiliate}>
                  {options.map((opt) => (
                    <SelectItem
                      affiliate={affiliate}
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                  {hasNext && (
                    <div className="p-2 border-t">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={onLoadMore}
                        className="w-full text-xs py-1 text-primary hover:underline font-medium"
                      >
                        {isLoading ? "Loading..." : "Load more affiliates..."}
                      </button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </FormControl>
          {fieldState.error && (
            <div className="text-destructive text-sm font-medium mt-1">
              {fieldState.error.message}
            </div>
          )}
        </FormItem>
      )}
    />
  )
}
