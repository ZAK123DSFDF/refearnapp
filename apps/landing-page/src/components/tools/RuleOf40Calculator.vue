<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">
            Rule of 40 Calculator
          </h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            SaaS Health Metric
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Year-over-Year Growth (%)</label
            >
            <div class="relative">
              <input
                v-model.number="form.growth"
                type="number"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 50"
              />
              <span
                class="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400"
                >%</span
              >
            </div>
            <p class="text-[10px] text-slate-400">
              Annual percentage increase in ARR.
            </p>
          </div>

          <div class="space-y-1 pt-2">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >EBITDA / Profit Margin (%)</label
            >
            <div class="relative">
              <input
                v-model.number="form.profit"
                type="number"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. -10"
              />
              <span
                class="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400"
                >%</span
              >
            </div>
            <p class="text-[10px] text-slate-400">
              Your net profit percentage (can be negative).
            </p>
          </div>
        </div>

        <div class="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
          <p class="mb-2 text-xs font-bold uppercase opacity-60">The Formula</p>
          <div class="flex items-center gap-3 font-mono text-sm">
            <span class="text-blue-400">{{ form.growth || 0 }}%</span>
            <span class="opacity-40">+</span>
            <span class="text-green-400">{{ form.profit || 0 }}%</span>
            <span class="opacity-40">=</span>
            <span
              class="text-xl font-bold"
              :class="score >= 40 ? 'text-blue-400' : 'text-white'"
              >{{ score }}%</span
            >
          </div>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div
          class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"
        >
          <p
            class="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase"
          >
            Combined Score
          </p>
          <h3
            class="mb-4 text-8xl font-black transition-all"
            :class="score >= 40 ? 'text-blue-600' : 'text-slate-900'"
          >
            {{ score }}%
          </h3>

          <div
            :class="statusBg"
            class="inline-block rounded-full px-6 py-2 text-sm font-bold text-white shadow-lg"
          >
            {{ statusLabel }}
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h5 class="mb-6 font-bold text-slate-800">Where you stand</h5>
          <div class="space-y-5">
            <div v-for="level in levels" :key="level.name" class="relative">
              <div
                class="mb-1 flex justify-between text-[10px] font-bold tracking-wider uppercase"
              >
                <span
                  :class="level.active ? 'text-blue-600' : 'text-slate-400'"
                  >{{ level.name }}</span
                >
                <span
                  v-if="level.active"
                  class="flex items-center gap-1 text-blue-600"
                >
                  <span class="relative flex h-2 w-2">
                    <span
                      class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"
                    ></span>
                    <span
                      class="relative inline-flex h-2 w-2 rounded-full bg-blue-500"
                    ></span>
                  </span>
                  Your Business
                </span>
              </div>
              <div class="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full transition-all duration-1000 ease-out"
                  :class="level.color"
                  :style="{ width: level.width }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <p class="text-xs leading-relaxed text-blue-800 italic">
            "The Rule of 40 suggests that if your growth and profit add up to
            40%, you are effectively balancing scaling with sustainability.
            Companies above 40% often command significantly higher valuation
            multiples."
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const form = reactive({
  growth: 50,
  profit: -5,
});

const score = computed(() => (form.growth || 0) + (form.profit || 0));

const statusLabel = computed(() => {
  if (score.value >= 50) return 'Elite Performance';
  if (score.value >= 40) return 'Healthy (Rule of 40 Met)';
  if (score.value >= 20) return 'Average Efficiency';
  return 'Danger Zone';
});

const statusBg = computed(() => {
  if (score.value >= 40) return 'bg-green-500';
  if (score.value >= 20) return 'bg-blue-500';
  return 'bg-red-500';
});

const levels = computed(() => [
  {
    name: 'Elite (50%+)',
    width: '100%',
    color: 'bg-green-500',
    active: score.value >= 50,
  },
  {
    name: 'Healthy (40%)',
    width: '80%',
    color: 'bg-blue-500',
    active: score.value >= 40 && score.value < 50,
  },
  {
    name: 'Passing (20%)',
    width: '40%',
    color: 'bg-slate-400',
    active: score.value >= 20 && score.value < 40,
  },
  {
    name: 'Distressed (<20%)',
    width: '15%',
    color: 'bg-red-400',
    active: score.value < 20,
  },
]);
</script>
