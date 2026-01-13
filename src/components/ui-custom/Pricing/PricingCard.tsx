import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function PricingCard({
  title,
  price,
  features,
  buttonText,
  disabled,
  highlight,
  onClick,
  pendingMessage,
  yearlySavings,
}: {
  title: string
  price: string
  features: string[]
  buttonText: string
  disabled?: boolean
  highlight?: boolean
  onClick?: () => void
  pendingMessage?: string | null
  yearlySavings?: number | null // Pass this from PricingGrid
}) {
  return (
    <div
      className={cn(
        "relative flex w-full max-w-[340px] flex-col p-8 text-left transition-all",
        highlight
          ? "border-primary overflow-hidden rounded-[2rem] border-2 bg-slate-900 text-white shadow-2xl hover:scale-[1.02]"
          : "border-border rounded-[2rem] border bg-white shadow-sm hover:shadow-md"
      )}
    >
      {/* "Most Popular" Badge for Ultimate */}
      {highlight && (
        <div className="bg-primary absolute top-0 right-0 rounded-bl-xl px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase">
          Most Popular
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div
            className={cn(
              "rounded-lg p-2",
              highlight ? "bg-white/10" : "bg-slate-100"
            )}
          >
            {/* Conditional Icon based on Title */}
            {title === "Pro" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-600"
              >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
                <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="m13 2-2 10h9L7 22l2-10H0L13 2z" />
              </svg>
            )}
          </div>
          <h3
            className={cn(
              "text-2xl font-bold",
              highlight ? "text-white" : "text-slate-900"
            )}
          >
            {title}
          </h3>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-4xl font-bold tracking-tight animate-fade-in",
                highlight ? "text-primary" : "text-slate-900"
              )}
            >
              {price.split(" ")[0]}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                highlight ? "text-slate-400" : "text-slate-500"
              )}
            >
              {price.includes("/") ? "/ month" : "one-time"}
            </span>
          </div>

          {/* Save / Year Logic (replaces discount badge) */}
          <div
            className={cn(
              "mt-1 flex h-5 items-center gap-1 text-sm font-bold transition-opacity",
              yearlySavings ? "opacity-100" : "opacity-0",
              highlight ? "text-emerald-400" : "text-emerald-500"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Save ${yearlySavings} / year</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <ul
        className={cn(
          "mb-8 flex-grow space-y-4 text-sm",
          highlight ? "text-white" : "text-slate-600"
        )}
      >
        {features.map((f) => {
          const isLimitedFeature =
            f.includes("1 organization") || f.includes("3 team member")
          const shouldShowCross = title === "Pro" && isLimitedFeature

          return (
            <li key={f} className="flex items-start gap-2">
              <span
                className={cn(
                  highlight && !shouldShowCross ? "text-primary" : ""
                )}
              >
                {shouldShowCross ? "❌" : "✔️"}
              </span>
              <span
                className={cn(
                  shouldShowCross && !highlight && "text-red-500/80"
                )}
              >
                {f}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Button Section */}
      <div className="flex flex-col gap-2">
        <button
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "block w-full rounded-2xl py-4 text-center font-bold transition-all active:scale-95",
            highlight
              ? "bg-primary hover:bg-primary/90 shadow-primary/20 text-white shadow-lg"
              : "bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02]",
            disabled && "opacity-50 cursor-not-allowed active:scale-100"
          )}
        >
          {buttonText}
        </button>
        {pendingMessage && (
          <p className="text-[10px] text-yellow-500 text-center leading-tight">
            {pendingMessage}
          </p>
        )}
      </div>
    </div>
  )
}
