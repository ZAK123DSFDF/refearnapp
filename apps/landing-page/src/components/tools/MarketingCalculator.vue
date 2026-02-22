<template>
  <div
    class="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
  >
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"
            >New Affiliates / Month</label
          >
          <input
            type="number"
            v-model="newAffiliates"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"
            >Avg. Sales per Affiliate</label
          >
          <input
            type="number"
            v-model="salesPerAffiliate"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"
            >Avg. Order Value ($)</label
          >
          <input
            type="number"
            v-model="aov"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div
        class="flex flex-col justify-center rounded-2xl bg-blue-600 p-6 text-white shadow-inner"
      >
        <div class="mb-4">
          <p class="text-xs font-bold tracking-widest uppercase opacity-80">
            Estimated Monthly Revenue (Year 1)
          </p>
          <h3 class="text-4xl font-black">${{ annualRunRate }}</h3>
        </div>
        <div class="border-t border-blue-400 pt-4">
          <p class="text-sm leading-snug opacity-90">
            By Month 12, you'll have
            <strong>{{ totalAffiliates }}</strong> active partners promoting
            your SaaS.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const newAffiliates = ref(5);
const salesPerAffiliate = ref(2);
const aov = ref(49);

const totalAffiliates = computed(() => newAffiliates.value * 12);

const annualRunRate = computed(() => {
  // Monthly revenue at the end of the year (Month 12)
  const monthlyRev =
    totalAffiliates.value * salesPerAffiliate.value * aov.value;
  return monthlyRev.toLocaleString();
});
</script>
