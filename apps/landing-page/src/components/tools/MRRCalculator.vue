<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">MRR Calculator</h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Configure your SaaS growth
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Current Customers</label
            >
            <div class="relative">
              <input
                v-model.number="stats.customers"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-4 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Avg. Revenue Per User (ARPU)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="stats.arpu"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-2">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500 uppercase"
                >Monthly Growth</label
              >
              <div class="relative">
                <input
                  v-model.number="stats.growth"
                  type="number"
                  class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span
                  class="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400"
                  >%</span
                >
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500 uppercase"
                >Monthly Churn</label
              >
              <div class="relative">
                <input
                  v-model.number="stats.churn"
                  type="number"
                  class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span
                  class="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400"
                  >%</span
                >
              </div>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-200"
        >
          <p class="text-xs font-bold uppercase opacity-80">Estimated MRR</p>
          <h2 class="text-4xl font-black">${{ formatNumber(currentMRR) }}</h2>
          <div class="mt-2 flex items-center gap-2 text-xs font-medium">
            <span class="rounded-full bg-blue-400/30 px-2 py-0.5"
              >Yearly: ${{ formatNumber(currentARR) }} ARR</span
            >
          </div>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div class="grid grid-cols-2 gap-4">
          <div
            class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <p
              class="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
            >
              Net Growth
            </p>
            <p
              class="text-2xl font-bold text-slate-900"
              :class="netGrowth >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ netGrowth > 0 ? '+' : '' }}{{ netGrowth.toFixed(1) }}%
            </p>
          </div>
          <div
            class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <p
              class="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
            >
              Customer LTV
            </p>
            <p class="text-2xl font-bold text-slate-900">
              ${{ formatNumber(ltv) }}
            </p>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h5 class="font-bold text-slate-800">12-Month Forecast</h5>
          </div>
          <div class="max-h-[400px] overflow-y-auto">
            <table class="w-full text-left text-sm">
              <thead
                class="sticky top-0 bg-white text-[10px] font-bold tracking-wider text-slate-400 uppercase"
              >
                <tr>
                  <th class="px-6 py-3">Month</th>
                  <th class="px-6 py-3">Customers</th>
                  <th class="px-6 py-3 text-right">Revenue (MRR)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr
                  v-for="m in forecast"
                  :key="m.month"
                  class="transition-colors hover:bg-slate-50/50"
                >
                  <td class="px-6 py-4 font-medium text-slate-600">
                    Month {{ m.month }}
                  </td>
                  <td class="px-6 py-4 font-semibold text-slate-900">
                    {{ formatNumber(m.customers) }}
                  </td>
                  <td class="px-6 py-4 text-right font-bold text-blue-600">
                    ${{ formatNumber(m.mrr) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const stats = reactive({
  customers: 100,
  arpu: 49,
  growth: 10, // Monthly %
  churn: 3, // Monthly %
});

const currentMRR = computed(() => stats.customers * stats.arpu);
const currentARR = computed(() => currentMRR.value * 12);
const netGrowth = computed(() => stats.growth - stats.churn);

// Lifetime Value = ARPU / Churn Rate
const ltv = computed(() => {
  if (stats.churn <= 0) return '∞';
  return (stats.arpu / (stats.churn / 100)).toFixed(0);
});

const forecast = computed(() => {
  let list = [];
  let currentCust = stats.customers;
  const netMultiplier = 1 + netGrowth.value / 100;

  for (let i = 1; i <= 12; i++) {
    currentCust = currentCust * netMultiplier;
    list.push({
      month: i,
      customers: Math.round(currentCust),
      mrr: Math.round(currentCust * stats.arpu),
    });
  }
  return list;
});

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};
</script>
