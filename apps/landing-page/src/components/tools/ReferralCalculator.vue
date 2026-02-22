<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-5">
      <div
        class="h-fit space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm lg:col-span-2"
      >
        <div>
          <h4 class="text-xl font-bold text-slate-900">
            Referral Loop Calculator
          </h4>
          <p
            class="text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            Calculate your Viral Growth
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Starting Users</label
            >
            <input
              v-model.number="form.initialUsers"
              type="number"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Avg. Invites per User</label
            >
            <input
              v-model.number="form.invitesPerUser"
              type="number"
              step="0.1"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Invite Conversion Rate (%)</label
            >
            <div class="relative">
              <input
                v-model.number="form.conversionRate"
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

        <div
          :class="
            viralCoefficient >= 1
              ? 'bg-green-600 text-white'
              : 'bg-slate-900 text-white'
          "
          class="rounded-2xl p-6 shadow-xl transition-colors"
        >
          <p class="text-[10px] font-bold tracking-widest uppercase opacity-70">
            Viral Coefficient (K)
          </p>
          <h2 class="text-4xl font-black">{{ viralCoefficient.toFixed(2) }}</h2>
          <p class="mt-2 text-xs leading-relaxed opacity-90">
            {{
              viralCoefficient >= 1
                ? '🔥 True Virality: Each user brings in more than 1 new user. Exponential growth!'
                : '📈 Steady Growth: You are gaining organic users, but not yet self-sustaining.'
            }}
          </p>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-3">
        <div class="grid grid-cols-2 gap-4">
          <div
            class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p
              class="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
            >
              Total Referred Users
            </p>
            <p class="text-3xl font-black text-slate-900">
              {{ formatNumber(totalReferred) }}
            </p>
          </div>
          <div
            class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p
              class="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
            >
              New Total Base
            </p>
            <p class="text-3xl font-black text-blue-600">
              {{ formatNumber(finalUsers) }}
            </p>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h5 class="font-bold text-slate-800">Referral Cycle Projection</h5>
          </div>
          <table class="w-full text-left text-sm">
            <thead
              class="border-b border-slate-50 text-[10px] font-bold tracking-wider text-slate-400 uppercase"
            >
              <tr>
                <th class="px-6 py-4">Cycle</th>
                <th class="px-6 py-4">New Users</th>
                <th class="px-6 py-4 text-right">Cumulative Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="c in cycles"
                :key="c.id"
                class="transition-colors hover:bg-blue-50/50"
              >
                <td class="px-6 py-4 font-medium text-slate-500">
                  Cycle {{ c.id }}
                </td>
                <td class="px-6 py-4 font-bold text-slate-900">
                  +{{ formatNumber(c.new) }}
                </td>
                <td class="px-6 py-4 text-right font-black text-slate-800">
                  {{ formatNumber(c.total) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p class="text-center text-xs leading-relaxed text-blue-800">
            <strong>The Viral Loop:</strong> Cycle 1 represents your first batch
            of users. Cycle 5 shows the "compounded" effect of those users
            inviting their friends, who invite more friends.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const form = reactive({
  initialUsers: 500,
  invitesPerUser: 3.5,
  conversionRate: 15,
});

const viralCoefficient = computed(
  () => form.invitesPerUser * (form.conversionRate / 100),
);

const cycles = computed(() => {
  let list = [];
  let currentTotal = form.initialUsers;
  let newUsersInCycle = form.initialUsers;

  for (let i = 1; i <= 5; i++) {
    newUsersInCycle = Math.round(newUsersInCycle * viralCoefficient.value);
    currentTotal += newUsersInCycle;
    list.push({
      id: i,
      new: newUsersInCycle,
      total: currentTotal,
    });
  }
  return list;
});

const totalReferred = computed(() =>
  cycles.value.reduce((acc, curr) => acc + curr.new, 0),
);
const finalUsers = computed(() => form.initialUsers + totalReferred.value);

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};
</script>
