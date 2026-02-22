<template>
  <div class="mx-auto w-full max-w-4xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-3">
      <div
        class="h-fit space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 lg:col-span-1"
      >
        <h4 class="mb-4 font-bold text-slate-900">Customize Template</h4>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-500 uppercase"
            >Company Name</label
          >
          <input
            v-model="form.company"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-500 uppercase"
            >Commission (%)</label
          >
          <input
            v-model="form.percent"
            type="number"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-500 uppercase"
            >Payout Method</label
          >
          <input
            v-model="form.method"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. PayPal or Stripe"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-500 uppercase"
            >Cookie Window (Days)</label
          >
          <input
            v-model="form.cookies"
            type="number"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          @click="copyTemplate"
          class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
        >
          <span>{{
            copied ? 'Copied to Clipboard!' : 'Copy Completed Text'
          }}</span>
        </button>
      </div>

      <div class="relative lg:col-span-2">
        <div
          class="prose prose-slate h-[600px] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-8 text-sm leading-relaxed text-slate-800 shadow-sm md:p-12"
        >
          <h2 class="mb-4 text-xl font-bold text-slate-900 uppercase">
            Affiliate Program Agreement
          </h2>

          <p class="mb-4">
            This Affiliate Agreement ("Agreement") is made between
            <span class="rounded bg-blue-50 px-1 font-bold text-blue-700">{{
              form.company || '[Company Name]'
            }}</span>
            ("Company") and the Affiliate. By signing up for the Program, you
            agree to the following terms:
          </p>

          <h3 class="mt-6 mb-2 font-bold text-slate-900">
            1. Commissions & Payouts
          </h3>
          <p>
            Affiliates will receive
            <span class="rounded bg-blue-50 px-1 font-bold text-blue-700"
              >{{ form.percent || '0' }}%</span
            >
            for every successful customer referral that completes a purchase.
            Payouts are made via
            <span class="rounded bg-blue-50 px-1 font-bold text-blue-700">{{
              form.method || '[Method]'
            }}</span>
            every 30 days.
          </p>

          <h3 class="mt-6 mb-2 font-bold text-slate-900">2. Cookie Policy</h3>
          <p>
            Tracking cookies are valid for
            <span class="rounded bg-blue-50 px-1 font-bold text-blue-700">{{
              form.cookies || '30'
            }}</span>
            days. If a user clicks the link and purchases within this window,
            the commission is credited to the Affiliate.
          </p>

          <h3 class="mt-6 mb-2 font-bold text-slate-900">
            3. Prohibited Activities
          </h3>
          <p>
            Affiliates may not use spam, deceptive advertising, or bidding on
            brand keywords (e.g., Google Ads for "<span
              class="rounded bg-blue-50 px-1 font-bold text-blue-700"
              >{{ form.company || 'Brand' }}</span
            >") unless explicitly permitted.
          </p>

          <h3 class="mt-6 mb-2 font-bold text-slate-900">4. Termination</h3>
          <p>
            Company reserves the right to terminate any Affiliate account at any
            time for violation of these terms.
          </p>

          <div
            class="mt-8 border-t border-slate-100 pt-8 text-slate-400 italic"
          >
            Disclaimer: This is a general template. Consult with legal counsel
            before using for your specific business.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const copied = ref(false);
const form = reactive({
  company: '',
  percent: 20,
  method: 'Stripe',
  cookies: 30,
});

const copyTemplate = () => {
  const text = `AFFILIATE PROGRAM AGREEMENT
This Affiliate Agreement ("Agreement") is made between ${form.company || '[YOUR COMPANY]'} ("Company") and the Affiliate.

1. Commissions & Payouts: Affiliates will receive ${form.percent}% for every successful referral. Payouts via ${form.method}.
2. Cookie Policy: Tracking cookies are valid for ${form.cookies} days.
3. Prohibited Activities: No spam or bidding on brand keywords for ${form.company || 'the Brand'}.
4. Termination: Company reserves the right to terminate accounts for violations.

Generated via RefearnApp. Consult legal counsel before use.`;

  navigator.clipboard.writeText(text);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};
</script>
