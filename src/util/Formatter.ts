// lib/formatters.ts

/**
 * Formats a number as a currency string based on the provided currency code.
 * @param amount - The numeric value to format
 * @param currency - The currency code (e.g., "USD", "EUR", "GBP")
 */
export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
