<template>
  <div
    class="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
  >
    <div class="space-y-6">
      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"
            >Your Website URL</label
          >
          <input
            type="text"
            v-model="baseUrl"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://mysaas.com"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"
            >Affiliate ID / Name</label
          >
          <input
            type="text"
            v-model="affiliateId"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john-doe"
          />
        </div>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-slate-50 p-6">
        <p
          class="mb-3 text-center text-xs font-bold tracking-widest text-slate-400 uppercase md:text-left"
        >
          Generated Affiliate Link
        </p>
        <div class="flex flex-col gap-3 md:flex-row">
          <div
            class="flex-grow rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm break-all text-blue-600"
          >
            {{ generatedLink }}
          </div>
          <button
            @click="copyLink"
            class="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-bold whitespace-nowrap text-white transition-colors hover:bg-blue-700"
          >
            <span v-if="!copied">Copy Link</span>
            <span v-else>Copied!</span>
          </button>
        </div>
      </div>

      <p class="text-center text-sm text-slate-500 italic">
        This uses the standard <code>?ref=</code> parameter used by RefearnApp.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const baseUrl = ref('https://refearn.app');
const affiliateId = ref('partner-123');
const copied = ref(false);

const generatedLink = computed(() => {
  let url = baseUrl.value.trim();
  if (!url) return '';
  if (!url.startsWith('http')) url = 'https://' + url;

  // Handle trailing slash and existing query params
  const separator = url.includes('?') ? '&' : '?';
  const cleanId = affiliateId.value.toLowerCase().replace(/\s+/g, '-');

  return `${url}${separator}ref=${cleanId}`;
});

const copyLink = () => {
  navigator.clipboard.writeText(generatedLink.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};
</script>
