<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">ARR Calculator</h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Annual Growth & Valuation
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Current Monthly Revenue (MRR)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="form.mrr"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label
              class="text-xs font-bold tracking-tight text-slate-400 text-slate-500 uppercase"
              >Monthly Expansion (Upsells)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="form.expansion"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Expected Annual Growth</label
            >
            <div class="relative">
              <input
                v-model.number="form.annualGrowth"
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
              >Valuation Multiple (e.g. 5x - 10x)</label
            >
            <div class="relative">
              <input
                v-model.number="form.multiple"
                type="number"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                class="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400"
                >x</span
              >
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
          <p class="text-xs font-bold uppercase opacity-60">
            Estimated Valuation
          </p>
          <h2 class="text-4xl font-black text-blue-400">
            ${{ formatNumber(valuation) }}
          </h2>
          <p class="mt-1 text-[10px] text-slate-400">
            Based on a {{ form.multiple }}x revenue multiple
          </p>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div
          class="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:text-left"
        >
          <div class="grid gap-8 md:grid-cols-2">
            <div>
              <p
                class="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase"
              >
                Current ARR
              </p>
              <h3 class="text-5xl font-black text-slate-900">
                ${{ formatNumber(currentARR) }}
              </h3>
            </div>
            <div
              class="flex flex-col justify-center border-t border-slate-100 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8"
            >
              <p
                class="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase"
              >
                Projected ARR (Year 1)
              </p>
              <h3 class="text-3xl font-bold text-blue-600">
                ${{ formatNumber(projectedARR) }}
              </h3>
            </div>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h5 class="font-bold text-slate-800">3-Year Revenue Roadmap</h5>
          </div>
          <table class="w-full text-left text-sm">
            <thead
              class="border-b border-slate-50 bg-white text-[10px] font-bold tracking-wider text-slate-400 uppercase"
            >
              <tr>
                <th class="px-6 py-4">Year</th>
                <th class="px-6 py-4">Annual Revenue</th>
                <th class="px-6 py-4 text-right">Monthly Target</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="y in roadmap"
                :key="y.year"
                class="transition-colors hover:bg-blue-50/30"
              >
                <td class="px-6 py-5 font-bold text-slate-700">
                  Year {{ y.year }}
                </td>
                <td class="px-6 py-5 font-black text-slate-900">
                  ${{ formatNumber(y.arr) }}
                </td>
                <td class="px-6 py-5 text-right font-medium text-slate-500">
                  ${{ formatNumber(y.mrr) }}/mo
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center"
        >
          <p class="text-sm text-slate-500">
            💡 <strong>Pro Tip:</strong> Increasing expansion revenue by just 5%
            can boost your valuation by hundreds of thousands.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const form = reactive({
  mrr: 10000,
  expansion: 500,
  annualGrowth: 50,
  multiple: 8,
});

const currentARR = computed(() => (form.mrr + form.expansion) * 12);

const projectedARR = computed(() => {
  return Math.round(currentARR.value * (1 + form.annualGrowth / 100));
});

const valuation = computed(() => currentARR.value * form.multiple);

const roadmap = computed(() => {
  let list = [];
  let base = currentARR.value;
  for (let i = 1; i <= 3; i++) {
    base = base * (1 + form.annualGrowth / 100);
    list.push({
      year: i,
      arr: Math.round(base),
      mrr: Math.round(base / 12),
    });
  }
  return list;
});

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};
</script>
