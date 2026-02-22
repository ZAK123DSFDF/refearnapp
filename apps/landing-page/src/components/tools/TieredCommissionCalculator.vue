<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">Tiered Commission</h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Volume-Based Payouts
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Monthly Sales Volume</label
            >
            <input
              v-model.number="form.sales"
              type="number"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Avg. Sale Price ($)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="form.price"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div class="space-y-3 border-t border-slate-200 pt-4">
          <p
            class="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
          >
            Active Tiers
          </p>
          <div
            v-for="(tier, index) in tiers"
            :key="index"
            class="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
          >
            <div
              class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 text-xs font-medium text-slate-600">
              Up to {{ tier.upto }} sales
            </div>
            <div class="font-bold text-slate-900">{{ tier.rate }}%</div>
          </div>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div
          class="relative overflow-hidden rounded-3xl bg-blue-600 p-10 text-white shadow-xl"
        >
          <p
            class="mb-2 text-xs font-bold tracking-widest uppercase opacity-80"
          >
            Total Affiliate Payout
          </p>
          <h3 class="mb-4 text-6xl font-black">
            ${{ formatNumber(totalPayout) }}
          </h3>

          <div class="flex items-center gap-3">
            <div
              class="rounded-full border border-white/10 bg-white/20 px-3 py-1 text-xs font-bold"
            >
              Avg. Rate: {{ effectiveRate.toFixed(1) }}%
            </div>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h5 class="font-bold text-slate-800">Earnings Breakdown</h5>
          </div>
          <table class="w-full text-left text-sm">
            <thead
              class="border-b border-slate-50 text-[10px] font-bold tracking-wider text-slate-400 uppercase"
            >
              <tr>
                <th class="px-6 py-4">Tier</th>
                <th class="px-6 py-4 text-center">Sales in Tier</th>
                <th class="px-6 py-4 text-right">Payout</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="res in calculation"
                :key="res.tier"
                :class="res.active ? 'bg-blue-50/50' : 'opacity-40'"
              >
                <td class="px-6 py-4 font-bold text-slate-700">
                  Tier {{ res.tier }} ({{ res.rate }}%)
                </td>
                <td class="px-6 py-4 text-center font-medium">
                  {{ res.volume }}
                </td>
                <td class="px-6 py-4 text-right font-black text-slate-900">
                  ${{ formatNumber(res.payout) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex items-start gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-lg"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 font-bold"
          >
            🚀
          </div>
          <div>
            <p class="mb-1 text-sm font-bold">Growth Lever</p>
            <p class="text-xs leading-relaxed text-slate-400">
              Tiered structures encourage affiliates to push harder as they
              approach the next bracket. Currently, your affiliates earn
              <strong
                >${{
                  formatNumber(
                    form.price * (tiers[tiers.length - 1].rate / 100),
                  )
                }}</strong
              >
              per sale at the highest tier.
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
  sales: 65,
  price: 100,
});

const tiers = [
  { upto: 10, rate: 10 },
  { upto: 50, rate: 15 },
  { upto: Infinity, rate: 25 },
];

const calculation = computed(() => {
  let remainingSales = form.sales;
  let previousLimit = 0;

  return tiers.map((tier, index) => {
    const tierLimit =
      tier.upto === Infinity ? Infinity : tier.upto - previousLimit;
    const salesInTier = Math.min(Math.max(remainingSales, 0), tierLimit);
    const payout = salesInTier * form.price * (tier.rate / 100);

    remainingSales -= salesInTier;
    previousLimit = tier.upto;

    return {
      tier: index + 1,
      rate: tier.rate,
      volume: salesInTier,
      payout: payout,
      active: salesInTier > 0,
    };
  });
});

const totalPayout = computed(() =>
  calculation.value.reduce((acc, curr) => acc + curr.payout, 0),
);
const effectiveRate = computed(
  () => (totalPayout.value / (form.sales * form.price || 1)) * 100,
);

const formatNumber = (num) => new Intl.NumberFormat().format(Math.round(num));
</script>
