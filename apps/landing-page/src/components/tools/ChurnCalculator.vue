<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">Churn Calculator</h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Leaky Bucket Analysis
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Users at Start of Month</label
            >
            <input
              v-model.number="form.startUsers"
              type="number"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="space-y-1">
            <label
              class="text-xs font-bold text-red-500 text-slate-500 uppercase"
              >Users Lost During Month</label
            >
            <input
              v-model.number="form.lostUsers"
              type="number"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div class="space-y-1 pt-2">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Monthly Recurring Revenue (MRR)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="form.mrr"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div
          :class="churnRate > 10 ? 'bg-red-600' : 'bg-slate-900'"
          class="rounded-2xl p-6 text-white shadow-xl transition-colors"
        >
          <p class="text-[10px] font-bold tracking-widest uppercase opacity-70">
            Monthly Churn Rate
          </p>
          <h2 class="text-4xl font-black">{{ churnRate.toFixed(1) }}%</h2>
          <p class="mt-2 text-xs opacity-90">
            {{
              churnRate > 10
                ? '⚠️ High Alert: You are losing 10%+ of your base monthly. Focus on retention!'
                : '✅ Healthy: Your churn is within manageable SaaS limits.'
            }}
          </p>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div
          class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm md:text-left"
        >
          <div class="relative z-10 grid gap-8 md:grid-cols-2">
            <div>
              <p
                class="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase"
              >
                Annualized Churn
              </p>
              <h3 class="text-5xl font-black text-slate-900">
                {{ annualizedChurn.toFixed(1) }}%
              </h3>
              <p class="mt-2 text-xs text-slate-500">
                Percentage of users lost per year.
              </p>
            </div>
            <div
              class="flex flex-col justify-center border-t border-slate-100 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8"
            >
              <p
                class="mb-1 text-xs font-bold tracking-widest text-red-400 uppercase"
              >
                Revenue Leakage (Yearly)
              </p>
              <h3 class="text-3xl font-bold text-red-600">
                -${{ formatNumber(revenueLeak) }}
              </h3>
            </div>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div
            class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4"
          >
            <h5 class="font-bold text-slate-800">Survival Projection</h5>
            <span class="text-[10px] font-bold text-slate-400 uppercase"
              >Assumes No New Signups</span
            >
          </div>
          <table class="w-full text-left text-sm">
            <thead
              class="border-b border-slate-50 text-[10px] font-bold tracking-wider text-slate-400 uppercase"
            >
              <tr>
                <th class="px-6 py-4">Timeline</th>
                <th class="px-6 py-4">Users Remaining</th>
                <th class="px-6 py-4 text-right">Revenue Remaining</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="p in projection"
                :key="p.label"
                class="transition-colors hover:bg-red-50/30"
              >
                <td class="px-6 py-4 font-medium text-slate-500">
                  {{ p.label }}
                </td>
                <td class="px-6 py-4 font-bold text-slate-900">
                  {{ formatNumber(p.users) }}
                </td>
                <td class="px-6 py-4 text-right font-black text-slate-800">
                  ${{ formatNumber(p.mrr) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-2xl border border-amber-100 bg-amber-50 p-6">
          <p class="text-xs leading-relaxed text-amber-800">
            💡 <strong>Pro Tip:</strong> Most successful B2B SaaS companies aim
            for <strong>Net Negative Churn</strong>, where expansion revenue
            from existing customers outweighs the revenue lost from churning
            customers.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const form = reactive({
  startUsers: 1000,
  lostUsers: 50,
  mrr: 25000,
});

const churnRate = computed(() => {
  if (!form.startUsers) return 0;
  return (form.lostUsers / form.startUsers) * 100;
});

const annualizedChurn = computed(() => {
  return (1 - Math.pow(1 - churnRate.value / 100, 12)) * 100;
});

const revenueLeak = computed(() => {
  return form.mrr * (churnRate.value / 100) * 12;
});

const projection = computed(() => {
  const rates = [
    { label: 'In 3 Months', power: 3 },
    { label: 'In 6 Months', power: 6 },
    { label: 'In 1 Year', power: 12 },
  ];

  return rates.map((r) => {
    const remainingFactor = Math.pow(1 - churnRate.value / 100, r.power);
    return {
      label: r.label,
      users: Math.round(form.startUsers * remainingFactor),
      mrr: Math.round(form.mrr * remainingFactor),
    };
  });
});

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};
</script>
