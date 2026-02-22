<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">Growth Forecaster</h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Compound Growth Logic
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Current MRR ($)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="form.startMRR"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Monthly Growth Rate (%)</label
            >
            <div class="relative">
              <input
                v-model.number="form.monthlyGrowth"
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
              >Monthly Churn (%)</label
            >
            <div class="relative">
              <input
                v-model.number="form.churn"
                type="number"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-red-500"
              />
              <span
                class="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400"
                >%</span
              >
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
          <p
            class="mb-1 text-[10px] font-bold tracking-widest uppercase opacity-60"
          >
            Net Monthly Growth
          </p>
          <h2 class="text-3xl font-black text-blue-400">
            {{ netGrowth.toFixed(1) }}%
          </h2>
          <p class="mt-2 text-[10px] opacity-50">
            This is your growth minus churn.
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
              3-Year Projected ARR
            </p>
            <h3 class="mb-4 text-6xl font-black">
              ${{ formatNumber(year3ARR) }}
            </h3>
            <div
              class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/20 px-3 py-1 text-xs font-medium"
            >
              <span
                class="h-2 w-2 animate-pulse rounded-full bg-green-400"
              ></span>
              {{ (year3ARR / (form.startMRR * 12 || 1)).toFixed(1) }}x increase
              from today
            </div>
          </div>
          <div
            class="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-[80px]"
          ></div>
        </div>

        <div
          class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h5 class="font-bold text-slate-800">Growth Milestones</h5>
          </div>
          <div class="space-y-6 p-6">
            <div
              v-for="milestone in milestones"
              :key="milestone.name"
              class="flex items-center gap-4"
            >
              <div
                :class="
                  milestone.reached
                    ? 'bg-green-100 text-green-600'
                    : 'bg-slate-100 text-slate-400'
                "
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-bold"
              >
                {{ milestone.reached ? '✓' : '—' }}
              </div>
              <div class="flex-1">
                <div class="mb-1 flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-900">{{
                    milestone.name
                  }}</span>
                  <span
                    class="text-xs font-bold"
                    :class="
                      milestone.reached ? 'text-blue-600' : 'text-slate-400'
                    "
                  >
                    {{ milestone.months }} Months
                  </span>
                </div>
                <div
                  class="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                >
                  <div
                    class="h-full bg-blue-500 transition-all duration-1000"
                    :style="{ width: milestone.reached ? '100%' : '10%' }"
                  ></div>
                </div>
              </div>
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
  startMRR: 5000,
  monthlyGrowth: 15,
  churn: 3,
});

const netGrowth = computed(() => form.monthlyGrowth - form.churn);

const calculateMonthsToTarget = (targetMRR) => {
  if (netGrowth.value <= 0) return 'Never';
  const months =
    Math.log(targetMRR / form.startMRR) / Math.log(1 + netGrowth.value / 100);
  return months > 0 ? Math.ceil(months) : 0;
};

const formatNumber = (num) => new Intl.NumberFormat().format(Math.round(num));

const year3ARR = computed(() => {
  const months = 36;
  const mrr = form.startMRR * Math.pow(1 + netGrowth.value / 100, months);
  return mrr * 12;
});

const milestones = computed(() => [
  {
    name: 'Traction ($10k MRR)',
    months: calculateMonthsToTarget(10000),
    reached: form.startMRR >= 10000,
  },
  {
    name: 'Growth ($50k MRR)',
    months: calculateMonthsToTarget(50000),
    reached: form.startMRR >= 50000,
  },
  {
    name: 'Scale ($83k MRR / $1M ARR)',
    months: calculateMonthsToTarget(83333),
    reached: form.startMRR >= 83333,
  },
  {
    name: 'Elite ($250k MRR)',
    months: calculateMonthsToTarget(250000),
    reached: form.startMRR >= 250000,
  },
]);
</script>
