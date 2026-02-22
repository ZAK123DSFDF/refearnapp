<script setup>
import { ref } from 'vue';

const activeIndex = ref(null);

const faqData = [
  {
    question: 'Can I try RefearnApp for free?',
    answer:
      'Yes! You can start a 14-day free trial on any of our subscription plans to explore all features—no credit card required. Please note that the Lifetime (One-Time) deals do not include a trial period; they are limited-time offers available for immediate purchase to secure permanent access at a single price.',
  },
  {
    question: 'How long will the Lifetime (One-Time) deals be available?',
    answer:
      'Our One-Time purchase options are part of a special launch offer and are available for a limited time only. We reserve the right to remove these deals at any moment. Once the offer ends, RefearnApp will transition exclusively to a subscription-based model, so we recommend securing your lifetime access while it’s still visible on the pricing page.',
  },
  {
    question: 'Do you offer a money-back guarantee?',
    answer:
      'Absolutely. We stand by our product with a 30-day money-back guarantee for both our lifetime deals and subscription plans. If RefearnApp isn’t the right fit for your SaaS within the first 30 days, just reach out to our support team, and we will issue a full refund—no questions asked.',
  },
  {
    question: 'Which platforms does RefearnApp support?',
    answer:
      'RefearnApp currently supports Stripe and Paddle for subscription tracking and payment reporting. We’re actively working on adding more integrations to support a wider range of billing platforms in the future.',
  },
  {
    question: 'How do I pay my affiliates?',
    answer:
      'You can export a complete CSV payout file directly from your dashboard. This contains all affiliate earnings for the selected period and can be used to send payments through PayPal Mass Pay or other processors. We plan to introduce automated payment flows in future updates.',
  },
  {
    question: 'Can I set how long affiliates get paid?',
    answer:
      'Absolutely. RefearnApp allows you to define exactly how long an affiliate should receive commissions—whether it’s for a few months or for the lifetime of the customer. You have complete control over the duration and time units.',
  },
];

const toggle = (index) => {
  // If clicking the same one, close it. Otherwise, open the new one and close others.
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>

<template>
  <section id="faq" class="bg-white px-6 py-24">
    <div class="mx-auto mb-12 max-w-3xl text-center">
      <h2 class="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
        Frequently Asked Questions
      </h2>
      <p class="mt-4 text-lg text-slate-500">
        Answers to the most common questions about RefearnApp.
      </p>
    </div>

    <div class="mx-auto max-w-3xl">
      <div class="space-y-2">
        <div
          v-for="(item, index) in faqData"
          :key="index"
          class="border-b border-slate-200"
        >
          <button
            @click="toggle(index)"
            class="hover:text-primary group flex w-full items-center justify-between py-6 text-left text-lg font-semibold transition-colors focus:outline-none"
          >
            <span
              :class="activeIndex === index ? 'text-primary' : 'text-slate-900'"
              >{{ item.question }}</span
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="group-hover:text-primary text-slate-400 transition-transform duration-300 ease-in-out"
              :class="{ 'rotate-180': activeIndex === index }"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <div
            class="overflow-hidden transition-all duration-300 ease-in-out"
            :style="{
              maxHeight: activeIndex === index ? '500px' : '0px',
              opacity: activeIndex === index ? '1' : '0',
            }"
          >
            <div class="pb-6 text-base leading-relaxed text-slate-500">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
