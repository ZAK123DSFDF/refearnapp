<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">
            Stripe Fee Calculator
          </h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Transaction Cost Analysis
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Amount to Charge ($)</label
            >
            <div class="relative">
              <span
                class="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="form.amount"
                type="number"
                class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-8 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-2">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500 uppercase"
                >Stripe Fee %</label
              >
              <div class="relative">
                <input
                  v-model.number="form.percent"
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
                >Fixed Fee ($)</label
              >
              <div class="relative">
                <span
                  class="absolute top-1/2 left-3 -translate-y-1/2 font-bold text-slate-400"
                  >$</span
                >
                <input
                  v-model.number="form.fixed"
                  type="number"
                  step="0.01"
                  class="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-6 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
          <p
            class="mb-1 text-[10px] font-bold tracking-widest uppercase opacity-60"
          >
            To Receive ${{ form.amount }} Net:
          </p>
          <h2 class="text-3xl font-black text-blue-400">
            ${{ grossUp.toFixed(2) }}
          </h2>
          <p class="mt-2 text-[10px] leading-tight opacity-50">
            Charge this amount to cover all Stripe fees.
          </p>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div
          class="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm md:text-left"
        >
          <div class="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p
                class="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase"
              >
                You Receive (Net)
              </p>
              <h3 class="text-6xl font-black text-slate-900">
                ${{ netAmount.toFixed(2) }}
              </h3>
            </div>
            <div class="rounded-2xl border border-red-100 bg-red-50 p-6">
              <p
                class="mb-1 text-xs font-bold tracking-widest text-red-400 uppercase"
              >
                Total Stripe Fees
              </p>
              <h3 class="text-3xl font-bold text-red-600">
                -${{ totalFees.toFixed(2) }}
              </h3>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h5 class="mb-4 font-bold text-slate-800">Revenue Share</h5>
          <div
            class="flex h-8 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              :style="{ width: (netAmount / form.amount) * 100 + '%' }"
              class="flex h-full items-center justify-center bg-blue-600 text-[10px] font-bold text-white transition-all duration-700"
            >
              YOU
            </div>
            <div
              :style="{ width: (totalFees / form.amount) * 100 + '%' }"
              class="h-full bg-red-400 transition-all duration-700"
            ></div>
          </div>
          <div
            class="mt-3 flex justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase"
          >
            <span
              >Net:
              {{ ((netAmount / (form.amount || 1)) * 100).toFixed(1) }}%</span
            >
            <span
              >Fees:
              {{ ((totalFees / (form.amount || 1)) * 100).toFixed(1) }}%</span
            >
          </div>
        </div>

        <div
          class="flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white"
          >
            i
          </div>
          <p class="text-xs leading-relaxed text-blue-800">
            Stripe typically deposits funds into your bank account on a
            <strong>2-day rolling basis</strong> for most SaaS businesses.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const form = reactive({
  amount: 100,
  percent: 2.9,
  fixed: 0.3,
});

const totalFees = computed(() => {
  if (!form.amount) return 0;
  return form.amount * (form.percent / 100) + form.fixed;
});

const netAmount = computed(() => {
  return Math.max(0, form.amount - totalFees.value);
});

// Formula to calculate what to charge to receive 'x' amount net:
// (Amount + Fixed Fee) / (1 - Percentage Fee)
const grossUp = computed(() => {
  const p = form.percent / 100;
  if (p >= 1) return 0;
  return (form.amount + form.fixed) / (1 - p);
});
</script>
