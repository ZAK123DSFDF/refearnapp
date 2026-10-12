<script setup lang="ts">
import { ref, computed, onMounted, shallowRef } from "vue";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { AVAILABLE_MODES, CURRENT_BILLING_MODE } from "../lib/pricing";
import { getBillingConfig } from "../lib/billing";
type BillingProvider = "polar" | "paddle";
const BILLING_PROVIDER = "polar" as BillingProvider;

const availableModes = AVAILABLE_MODES;
const billingMode = ref(CURRENT_BILLING_MODE);

const activePaddle = shallowRef<Paddle | null>(null);
onMounted(async () => {
  if (BILLING_PROVIDER !== "paddle") return;
  const { paddle } = getBillingConfig();
  const paddleInstance = await initializePaddle({
    token: paddle.token,
    environment: paddle.env,
    eventCallback: (event) => {
      if (event.name === "checkout.completed") {
        const txnId = event.data?.transaction_id;
        window.location.href = `/signup?txn=${txnId}`;
      }
    },
  });

  if (paddleInstance) {
    activePaddle.value = paddleInstance;
  }
});

const handleAction = async (plan: "pro" | "ult") => {
  const cfg = getBillingConfig();
  if (billingMode.value === "PURCHASE") {
    if (BILLING_PROVIDER === "polar") {
      const link =
        plan === "pro" ? cfg.polar.pro_one_time : cfg.polar.ult_one_time;
      await PolarEmbedCheckout.create(link, { theme: "light" });
      return;
    }
    const priceId =
      plan === "pro" ? cfg.paddle.pro_one_time : cfg.paddle.ult_one_time;

    if (!activePaddle.value) {
      console.error("Paddle is still loading...");
      return;
    }

    activePaddle.value.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: "light",
      },
      items: [{ priceId: priceId, quantity: 1 }],
    });
  } else {
    window.location.href = "/signup";
  }
};
const cycle = ref<"MONTHLY" | "YEARLY">("MONTHLY");

const featuresList = [
  { name: "Unlimited affiliates signup", pro: true, ultimate: true },
  { name: "Unlimited revenue from affiliate", pro: true, ultimate: true },
  { name: "PayPal mass payout", pro: true, ultimate: true },
  { name: "Custom domain", pro: true, ultimate: true },
  { name: "Affiliate page customization", pro: true, ultimate: true },
  { name: "Integrate with Stripe and Paddle", pro: true, ultimate: true },
  { name: "Cookie attribution customization", pro: true, ultimate: true },
  { name: "Set commission durations", pro: true, ultimate: true },
  { name: "Coupon code tracking", pro: true, ultimate: true },
  { name: "Advanced analytics & reports", pro: true, ultimate: true },
  { name: "Two-sided incentives", pro: true, ultimate: true },
  { name: "1 organization", pro: true, ultimate: false },
  { name: "Unlimited organizations", pro: false, ultimate: true },
  { name: "Up to 3 team member invitations", pro: true, ultimate: false },
  { name: "Unlimited team member invitations", pro: false, ultimate: true },
];
const enterpriseFeatures = [
  "Full-service data migration from existing platforms",
  "White-glove VPS setup & technical deployment",
  "Automated tax compliance & W-8 management for affiliate payouts",
  "Priority maintenance, 24/7 support & emergency response",
  "Custom integration & tailored API support",
  "Dedicated account manager",
];
const communityFeatures = [
  "Unlimited affiliate tracking",
  "Self-host on your own infrastructure",
  "Unlimited affiliates",
  "Unlimited revenue attribution",
  "PayPal mass payout",
  "Customizable commission durations",
  "Cookie attribution settings",
  "Stripe and Paddle integration",
  "Unlimited organizations",
  "Public Discord community access",
  "Open-source codebase",
];
const prices = computed(() => {
  if (billingMode.value === "PURCHASE") {
    return { pro: "199", ult: "299", cycle: "one-time", saved: null };
  }
  if (cycle.value === "MONTHLY") {
    return { pro: "29", ult: "39", cycle: "/ month", saved: null };
  }
  return {
    pro: "24",
    ult: "33",
    cycle: "/ month",
    saved: { pro: 58, ult: 78 },
  };
});
</script>
<template>
  <section id="pricing" class="bg-secondary/30 overflow-hidden py-24">
    <div class="mx-auto max-w-5xl px-4 text-center md:px-6">
      <h2
        class="mb-4 px-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl"
      >
        Simple, Transparent Pricing
      </h2>
      <p
        class="mx-auto mb-12 max-w-2xl px-4 text-base text-slate-500/80 md:text-lg"
      >
        Everything you need to launch and scale your affiliate program.
      </p>

      <div class="mb-12 flex w-full flex-col items-center gap-6 px-2">
        <div
          v-if="availableModes.length > 1"
          class="border-border relative inline-flex w-full max-w-85 rounded-2xl border bg-gray-200/50 p-1 md:max-w-md md:p-1.5"
        >
          <div class="absolute -top-4 -left-2 z-10 md:-left-6">
            <span
              class="inline-block -rotate-12 transform rounded-lg border-2 border-white bg-yellow-400 px-3 py-1 text-[10px] font-black tracking-wider text-black uppercase shadow-lg md:text-xs"
            >
              LIMITED TIME OFFER
            </span>
          </div>
          <button
            @click="
              billingMode = 'PURCHASE';
              cycle = 'MONTHLY';
            "
            :class="[
              billingMode === 'PURCHASE'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600',
            ]"
            class="flex flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all md:px-8 md:py-3 md:text-base"
          >
            One-Time
          </button>
          <button
            @click="billingMode = 'SUBSCRIPTION'"
            :class="[
              billingMode === 'SUBSCRIPTION'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600',
            ]"
            class="flex flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all md:px-8 md:py-3 md:text-base"
          >
            Subscription
          </button>
        </div>
        <div
          v-if="
            availableModes.includes('PURCHASE') &&
            !availableModes.includes('SUBSCRIPTION')
          "
          class="mb-4"
        >
          <span
            class="inline-block rounded-lg border-4 border-white bg-yellow-400 px-4 py-1.5 text-xl font-black tracking-widest text-black uppercase shadow-sm"
          >
            LIMITED TIME OFFER
          </span>
        </div>
        <div
          v-if="billingMode === 'SUBSCRIPTION'"
          class="animate-fade-in flex w-full justify-center"
        >
          <div
            class="border-border inline-flex rounded-xl border bg-white/50 p-1 text-xs md:text-sm"
          >
            <button
              @click="cycle = 'MONTHLY'"
              :class="[
                cycle === 'MONTHLY'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500',
              ]"
              class="rounded-lg px-4 py-1.5 font-semibold whitespace-nowrap"
            >
              Monthly
            </button>
            <button
              @click="cycle = 'YEARLY'"
              :class="[
                cycle === 'YEARLY'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ]"
              class="flex items-center gap-1 rounded-lg px-4 py-1.5 font-semibold whitespace-nowrap"
            >
              Yearly
              <span
                :class="[
                  cycle === 'YEARLY'
                    ? 'bg-yellow-400 font-black text-black'
                    : 'bg-emerald-100 font-bold text-emerald-700',
                ]"
                class="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] uppercase md:text-[10px]"
                >2 Months Free</span
              >
            </button>
          </div>
        </div>
      </div>

      <div
        class="flex flex-wrap items-stretch justify-center gap-8 px-2 md:flex-nowrap"
      >
        <div
          class="border-border flex w-full max-w-85 flex-col rounded-4xl border bg-slate-50 p-8 text-left shadow-sm transition-all hover:shadow-md"
        >
          <div class="mb-8">
            <div class="mb-2 flex items-center gap-2">
              <div class="rounded-lg bg-slate-100 p-2 text-slate-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-slate-900">Community</h3>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-bold tracking-tight text-slate-900"
                >Free</span
              >
            </div>
          </div>
          <ul class="mb-8 grow space-y-4 text-slate-600">
            <li
              v-for="feat in communityFeatures"
              :key="feat"
              class="flex items-start gap-2 text-sm"
            >
              <span>✔️</span> <span>{{ feat }}</span>
            </li>
          </ul>
          <a
            href="/docs"
            class="block w-full rounded-2xl border border-slate-900 bg-transparent py-4 text-center font-bold text-slate-900 transition-all hover:bg-slate-900 hover:text-white active:scale-95"
          >
            View Documentation
          </a>
        </div>
        <div
          class="border-border flex w-full max-w-85 flex-col rounded-4xl border bg-white p-8 text-left shadow-sm transition-all hover:shadow-md"
        >
          <div class="mb-8">
            <div class="mb-2 flex items-center gap-2">
              <div class="rounded-lg bg-slate-100 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-slate-600"
                >
                  <path
                    d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
                  />
                  <path
                    d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
                  />
                  <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
                  <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-slate-900">Pro</h3>
            </div>
            <div class="flex flex-col">
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-bold tracking-tight text-slate-900"
                  >${{ prices.pro }}</span
                >
                <span class="text-sm font-medium text-slate-500">{{
                  prices.cycle
                }}</span>
              </div>
              <div
                :class="prices.saved ? 'opacity-100' : 'opacity-0'"
                class="mt-1 flex h-5 items-center gap-1 text-sm font-bold text-emerald-500 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  />
                </svg>
                <span>Save ${{ prices.saved?.pro }} / year</span>
              </div>
            </div>
          </div>
          <ul class="mb-8 grow space-y-4 text-slate-600">
            <li
              v-for="f in featuresList.filter((f) => f.pro)"
              :key="f.name"
              :class="[
                f.name.includes('1 organization') ||
                f.name.includes('3 team member')
                  ? 'text-red-500/80'
                  : '',
              ]"
              class="flex items-start gap-2 text-sm"
            >
              <span>{{
                f.name.includes("1 organization") ||
                f.name.includes("3 team member")
                  ? "❌"
                  : "✔️"
              }}</span>
              <span>{{ f.name }}</span>
            </li>
          </ul>
          <a
            href="/signup"
            @click.prevent="handleAction('pro')"
            class="block w-full rounded-2xl bg-slate-900 py-4 text-center font-bold text-white transition-all hover:scale-[1.02] hover:bg-slate-800 active:scale-95"
          >
            {{
              billingMode === "PURCHASE" ? "Buy Pro Plan" : "Start 14-Day Trial"
            }}
          </a>
        </div>

        <div
          class="border-primary relative flex w-full max-w-85 flex-col overflow-hidden rounded-4xl border-2 bg-slate-900 p-8 text-left text-white shadow-2xl transition-all hover:scale-[1.02]"
        >
          <div
            class="bg-primary absolute top-0 right-0 rounded-bl-xl px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase"
          >
            Most Popular
          </div>
          <div class="mb-8">
            <div class="mb-2 flex items-center gap-2">
              <div class="rounded-lg bg-white/10 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-primary"
                >
                  <path d="m13 2-2 10h9L7 22l2-10H0L13 2z" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white">Ultimate</h3>
            </div>
            <div class="flex flex-col">
              <div class="flex items-baseline gap-1">
                <span class="text-primary text-4xl font-bold tracking-tight"
                  >${{ prices.ult }}</span
                >
                <span class="text-sm font-medium text-slate-400">{{
                  prices.cycle
                }}</span>
              </div>
              <div
                :class="prices.saved ? 'opacity-100' : 'opacity-0'"
                class="mt-1 flex h-5 items-center gap-1 text-sm font-bold text-emerald-400 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  />
                </svg>
                <span>Save ${{ prices.saved?.ult }} / year</span>
              </div>
            </div>
          </div>
          <ul class="mb-8 grow space-y-4">
            <li
              v-for="f in featuresList.filter((f) => f.ultimate)"
              :key="f.name"
              class="flex items-start gap-2 text-sm"
            >
              <span class="text-primary">✔️</span>
              <span>{{ f.name }}</span>
            </li>
          </ul>
          <a
            href="/signup"
            @click.prevent="handleAction('ult')"
            class="bg-primary hover:bg-primary/90 shadow-primary/20 block w-full rounded-2xl py-4 text-center font-bold text-white shadow-lg transition-all active:scale-95"
          >
            {{
              billingMode === "PURCHASE"
                ? "Buy Ultimate Plan"
                : "Start 14-Day Trial"
            }}
          </a>
        </div>
      </div>
      <div
        class="border-border mt-8 flex w-full flex-col rounded-4xl border bg-slate-900 p-8 text-left shadow-sm transition-all hover:shadow-md md:flex-row md:items-center md:justify-between md:gap-12"
      >
        <div class="flex-1">
          <h3 class="mb-2 text-2xl font-bold text-white">Custom Solutions</h3>
          <p class="mb-6 text-slate-400">
            Need something tailored? We partner with organizations for
            <strong>custom integrations</strong>, high-volume requirements, and
            specialized infrastructure needs.
          </p>
          <ul class="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
            <li
              v-for="feat in enterpriseFeatures"
              :key="feat"
              class="flex items-center gap-2 text-sm text-slate-300"
            >
              <span class="text-primary font-bold">✓</span> {{ feat }}
            </li>
          </ul>
        </div>

        <div class="mt-8 shrink-0 md:mt-0">
          <a
            href="/contact"
            class="block rounded-2xl bg-white px-12 py-4 text-center font-bold text-slate-900 transition-all hover:scale-[1.02] hover:bg-slate-100 active:scale-95"
          >
            Request a Custom Solution
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
