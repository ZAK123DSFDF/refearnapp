<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">SaaS LTV Calculator</h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Customer Value Analysis
          </p>
        </div>

        <div class="space-y-4">
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
        </div>

        <div class="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
          <p class="text-xs font-bold tracking-widest uppercase opacity-70">
            Average Lifespan
          </p>
          <h2 class="text-4xl font-black text-blue-400">
            {{ customerLifespan.toFixed(1) }}
            <span class="text-xl">Months</span>
          </h2>
          <p class="mt-2 text-xs opacity-60">
            The time a customer stays subscribed.
          </p>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div
          class="relative overflow-hidden rounded-3xl bg-blue-600 p-10 text-white shadow-2xl"
        >
          <div class="relative z-10">
            <p
              class="mb-2 text-xs font-bold tracking-widest uppercase opacity-80"
            >
              Customer Lifetime Value (LTV)
            </p>
            <h3 class="mb-4 text-6xl font-black">${{ formatNumber(ltv) }}</h3>
            <p class="max-w-sm text-sm opacity-90">
              With a
              <span class="rounded bg-blue-500 px-1 font-bold"
                >{{ form.margin }}% margin</span
              >, this is the net profit you earn from one user.
            </p>
          </div>
          <div
            class="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"
          ></div>
        </div>

        <div
          class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h5 class="font-bold text-slate-800">Unit Economics</h5>
          </div>
          <div class="space-y-6 p-8">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase">
                  Gross Lifetime Revenue
                </p>
                <p class="text-2xl font-bold text-slate-900">
                  ${{ formatNumber(lifetimeRevenue) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs font-bold text-slate-400 uppercase">
                  Monthly Profit
                </p>
                <p class="text-2xl font-bold text-green-600">
                  ${{ formatNumber(form.arpu * (form.margin / 100)) }}
                </p>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-6">
              <p class="text-sm leading-relaxed text-slate-600">
                Formula used:
                <span
                  class="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs text-blue-700"
                  >(ARPU / Churn) × Margin %</span
                >
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
});

const customerLifespan = computed(() => 1 / (form.churn / 100) || 0);
const lifetimeRevenue = computed(() => form.arpu * customerLifespan.value);
const ltv = computed(() => lifetimeRevenue.value * (form.margin / 100));

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(Math.round(num));
};
</script>
