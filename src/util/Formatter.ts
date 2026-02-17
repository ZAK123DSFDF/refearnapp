// lib/formatters.ts

/**
 * Formats a number as a currency string based on the provided currency code.
 * @param amount - The numeric value to format
 * @param currency - The currency code (e.g., "USD", "EUR", "GBP")
 */
// util/Formatter.ts

export function formatCurrency(amount: number, currency: string = "USD") {
  // Ensure we have a valid string and it's Uppercase (e.g., 'gbp' -> 'GBP')
  const code = (currency || "USD").toUpperCase()

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    // Fix the decimal problem: enforces exactly 2 decimal places
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
