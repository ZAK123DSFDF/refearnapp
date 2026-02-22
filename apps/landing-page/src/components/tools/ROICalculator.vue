<template>
  <div
    class="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
  >
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"
            >Monthly Website Visitors</label
          >
          <input
            type="number"
            v-model="visitors"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"
            >Customer LTV ($)</label
          >
          <input
            type="number"
            v-model="ltv"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"
            >Referral Conversion Rate (%)</label
          >
          <input
            type="number"
            step="0.1"
            v-model="convRate"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div
        class="flex flex-col justify-center rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center md:text-left"
      >
        <div class="mb-4">
          <p class="text-sm font-bold tracking-wider text-blue-600 uppercase">
            Potential Monthly ROI
          </p>
          <h3 class="text-4xl font-black text-slate-900">
            ${{ potentialROI }}
          </h3>
        </div>
        <div class="border-t border-blue-200 pt-4">
          <p class="text-xs leading-tight text-slate-500">
            Based on a conservative 10% referral invite rate from your current
            traffic.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const visitors = ref(5000);
const ltv = ref(50);
const convRate = ref(2); // 2% of referred traffic converts

const potentialROI = computed(() => {
  // Logic: 10% of visitors refer 1 person. 2% of those clickers convert.
  const referredLeads = visitors.value * 0.1;
  const newCustomers = referredLeads * (convRate.value / 100);
  return Math.round(newCustomers * ltv.value).toLocaleString();
});
</script>
