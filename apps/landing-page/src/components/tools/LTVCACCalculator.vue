<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">LTV Calculator</h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Customer Lifetime Value
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Avg. Monthly Revenue (ARPU)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="form.arpu"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Monthly Churn Rate (%)</label
            >
            <div class="relative">
              <input
                v-model.number="form.churn"
                type="number"
                step="0.1"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                class="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400"
                >%</span
              >
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Gross Margin (%)</label
            >
            <div class="relative">
              <input
                v-model.number="form.margin"
                type="number"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                class="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400"
                >%</span
              >
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Acquisition Cost (CAC)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="form.cac"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div
          :class="
            ltvCacRatio >= 3
              ? 'bg-green-600 text-white'
              : 'bg-amber-500 text-white'
          "
          class="rounded-2xl p-6 shadow-xl transition-colors"
        >
          <p class="text-[10px] font-bold tracking-widest uppercase opacity-70">
            LTV : CAC Ratio
          </p>
          <h2 class="text-4xl font-black">{{ ltvCacRatio.toFixed(1) }}x</h2>
          <p class="mt-2 text-xs leading-relaxed opacity-90">
            {{
              ltvCacRatio >= 3
                ? '🚀 Ideal: Your LTV is more than 3x your CAC. This is a highly scalable business.'
                : '⚠️ Warning: An LTV:CAC below 3x usually indicates a struggle to reach profitability.'
            }}
          </p>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div
          class="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-center text-white shadow-2xl md:text-left"
        >
          <p
            class="mb-2 text-xs font-bold tracking-widest text-blue-400 uppercase"
          >
            Total Lifetime Value
          </p>
          <h3 class="mb-4 text-6xl font-black">${{ formatNumber(ltv) }}</h3>
          <p class="max-w-sm text-sm text-slate-400">
            Based on an average customer lifespan of
            <span class="font-bold text-white"
              >{{ customerLifespan.toFixed(1) }} months</span
            >.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-3xl border border-slate-200 bg-white p-6">
            <p
              class="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
            >
              Lifetime Revenue
            </p>
            <p class="text-2xl font-bold text-slate-900">
              ${{ formatNumber(lifetimeRevenue) }}
            </p>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-white p-6">
            <p
              class="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
            >
              Lifetime Profit
            </p>
            <p class="text-2xl font-bold text-green-600">
              ${{ formatNumber(ltv) }}
            </p>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h5 class="mb-4 font-bold text-slate-800">Why LTV Matters</h5>
          <div class="space-y-4 text-sm leading-relaxed text-slate-600">
            <p>
              By paying
              <span class="font-bold text-slate-900">${{ form.cac }}</span> to
              acquire a customer, you are effectively buying
              <span class="font-bold text-green-600"
                >${{ formatNumber(ltv) }}</span
              >
              in future gross profit.
            </p>
            <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p class="text-xs italic">
                "For most SaaS companies, the benchmark is an LTV:CAC ratio of
                <strong>3.0 or higher</strong>. If yours is lower, you should
                focus on reducing churn or increasing your pricing."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const form = reactive({
  arpu: 49,
  churn: 3.5,
  margin: 85,
  cac: 150,
});

const customerLifespan = computed(() => 1 / (form.churn / 100));
const lifetimeRevenue = computed(() => form.arpu * customerLifespan.value);
const ltv = computed(() => lifetimeRevenue.value * (form.margin / 100));
const ltvCacRatio = computed(() => ltv.value / (form.cac || 1));

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(Math.round(num));
};
</script>
