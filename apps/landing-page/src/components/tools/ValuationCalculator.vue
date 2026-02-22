<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">Valuation Calculator</h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Investor-Grade Analysis
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Annual Recurring Revenue (ARR)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="form.arr"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Annual Growth Rate (%)</label
            >
            <input
              v-model.number="form.growth"
              type="number"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Net Profit Margin (%)</label
            >
            <input
              v-model.number="form.profit"
              type="number"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Gross Logo Churn (Annual %)</label
            >
            <input
              v-model.number="form.churn"
              type="number"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div
          :class="
            ruleOf40 >= 40
              ? 'border-green-200 bg-green-50'
              : 'border-amber-200 bg-amber-50'
          "
          class="rounded-2xl border p-4"
        >
          <div class="mb-1 flex items-center justify-between">
            <span
              class="text-xs font-bold uppercase"
              :class="ruleOf40 >= 40 ? 'text-green-700' : 'text-amber-700'"
              >Rule of 40 Score</span
            >
            <span
              class="text-lg font-black"
              :class="ruleOf40 >= 40 ? 'text-green-800' : 'text-amber-800'"
              >{{ ruleOf40 }}%</span
            >
          </div>
          <p class="text-[10px] leading-tight text-slate-600">
            Investors look for a combined Growth + Profit score of 40%+ for
            "Elite" SaaS status.
          </p>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div
          class="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl"
        >
          <div class="relative z-10">
            <p
              class="mb-2 text-xs font-bold tracking-widest text-blue-400 uppercase"
            >
              Estimated Market Valuation
            </p>
            <h3 class="mb-4 text-5xl font-black md:text-6xl">
              ${{ formatNumber(estimatedValuation) }}
            </h3>
            <div class="flex flex-wrap gap-4">
              <div
                class="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm"
              >
                Multiple:
                <span class="font-bold"
                  >{{ calculatedMultiple.toFixed(1) }}x</span
                >
              </div>
              <div
                class="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm"
              >
                Confidence: <span class="font-bold text-green-400">High</span>
              </div>
            </div>
          </div>
          <div
            class="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600 opacity-20 blur-[100px]"
          ></div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-3xl border border-slate-200 bg-white p-6">
            <p class="mb-4 text-xs font-bold text-slate-400 uppercase">
              Valuation Ranges
            </p>
            <div class="space-y-4">
              <div class="flex items-end justify-between">
                <span class="text-sm text-slate-600">Conservative (4x)</span>
                <span class="font-bold text-slate-900"
                  >${{ formatNumber(form.arr * 4) }}</span
                >
              </div>
              <div
                class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
              >
                <div class="h-full w-[40%] bg-slate-300"></div>
              </div>
              <div class="flex items-end justify-between">
                <span class="text-sm text-slate-600">Aggressive (12x)</span>
                <span class="font-bold text-slate-900"
                  >${{ formatNumber(form.arr * 12) }}</span
                >
              </div>
              <div
                class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
              >
                <div class="h-full w-[90%] bg-blue-500"></div>
              </div>
            </div>
          </div>

          <div
            class="flex flex-col justify-center rounded-3xl border border-slate-200 bg-white p-6"
          >
            <p class="mb-2 text-xs font-bold text-slate-400 uppercase">
              Growth Multiplier Effect
            </p>
            <p class="text-sm leading-relaxed text-slate-600">
              Your
              <span class="font-bold text-blue-600"
                >{{ form.growth }}% growth</span
              >
              and
              <span class="font-bold text-blue-600"
                >{{ form.churn }}% churn</span
              >
              suggests a
              <strong>{{ calculatedMultiple.toFixed(1) }}x</strong> multiple in
              the current market.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const form = reactive({
  arr: 500000,
  growth: 45,
  profit: 10,
  churn: 8,
});

const ruleOf40 = computed(() => form.growth + form.profit);

const calculatedMultiple = computed(() => {
  // Simple heuristic for SaaS multiples in 2026:
  // Base 4x + Growth bonus + Churn penalty
  let base = 4.0;
  base += form.growth / 10; // +1x for every 10% growth
  if (form.churn < 5) base += 1.5; // Premium for low churn
  if (form.churn > 15) base -= 2.0; // Penalty for leaky bucket
  if (ruleOf40.value > 40) base += 2.0; // Rule of 40 premium

  return Math.max(base, 3.0); // Floor of 3x
});

const estimatedValuation = computed(() => form.arr * calculatedMultiple.value);

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(Math.round(num));
};
</script>
