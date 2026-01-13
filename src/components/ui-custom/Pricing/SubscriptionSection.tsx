import { PlanInfo } from "@/lib/types/planInfo"
import { FeatureList } from "@/lib/types/FeatureList"
import { SubscriptionCycle } from "@/components/ui-custom/Pricing/PricingClient"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PricingGrid } from "@/components/ui-custom/Pricing/PricingGrid"
import { getResponsiveTabSize } from "@/util/GetResponsiveTabSize"

export function SubscriptionSection({
  dashboard,
  plan,
  featuresList,
  getButtonText,
  subscriptionCycle,
  setSubscriptionCycle,
}: {
  dashboard: boolean
  plan?: PlanInfo | null
  featuresList: FeatureList[]
  getButtonText: (p: PlanInfo["plan"]) => string
  subscriptionCycle: SubscriptionCycle
  setSubscriptionCycle: (v: SubscriptionCycle) => void
}) {
  return (
    <>
      {/* Monthly / Yearly Switch (always visible) */}
      <div className="flex justify-center mb-6 animate-fade-in">
        <Tabs
          value={subscriptionCycle}
          onValueChange={(v) => setSubscriptionCycle(v as SubscriptionCycle)}
          className="flex justify-center mb-12"
        >
          <TabsList className="border-border inline-flex rounded-xl border bg-white/50 p-1 text-xs md:text-sm h-auto">
            <TabsTrigger
              value="MONTHLY"
              className={cn(
                getResponsiveTabSize(0.85),
                "rounded-lg px-4 py-1.5 font-semibold whitespace-nowrap transition-all",
                "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500",
                subscriptionCycle === "MONTHLY"
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-500"
              )}
            >
              Monthly
            </TabsTrigger>

            <TabsTrigger
              value="YEARLY"
              className={cn(
                getResponsiveTabSize(0.85),
                "flex items-center gap-1 rounded-lg px-4 py-1.5 font-semibold whitespace-nowrap transition-all",
                "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700"
              )}
            >
              Yearly
              <span
                className={cn(
                  "shrink-0 rounded-md px-1.5 py-0.5 text-[9px] uppercase md:text-[10px] transition-colors",
                  subscriptionCycle === "YEARLY"
                    ? "bg-yellow-400 font-black text-black" // Active state colors
                    : "bg-emerald-100 font-bold text-emerald-700" // Inactive state colors
                )}
              >
                2 Months Free
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <PricingGrid
        billingType="SUBSCRIPTION"
        dashboard={dashboard}
        plan={plan}
        subscriptionCycle={subscriptionCycle}
        featuresList={featuresList}
        getButtonText={getButtonText}
      />
    </>
  )
}
