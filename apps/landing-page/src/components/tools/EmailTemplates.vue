<template>
  <div class="mx-auto w-full max-w-4xl space-y-8">
    <div class="grid gap-8 lg:grid-cols-3">
      <div
        class="h-fit space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 lg:col-span-1"
      >
        <h4 class="mb-4 font-bold text-slate-900">Customize Emails</h4>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-500 uppercase"
            >Your Name</label
          >
          <input
            v-model="form.sender"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Alex"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-500 uppercase"
            >Friend's Name</label
          >
          <input
            v-model="form.friendName"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. John"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-500 uppercase"
            >SaaS Name</label
          >
          <input
            v-model="form.saas"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-500 uppercase"
            >Your Website URL</label
          >
          <input
            v-model="form.websiteUrl"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="mysaas.com"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-500 uppercase"
            >Reward</label
          >
          <input
            v-model="form.reward"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="border-t border-slate-200 pt-4">
          <label class="mb-2 block text-xs font-bold text-slate-500 uppercase"
            >Select Email Type</label
          >
          <div class="flex flex-col gap-2">
            <button
              v-for="(label, key) in templateLabels"
              :key="key"
              @click="activeKey = key"
              :class="
                activeKey === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300'
              "
              class="rounded-xl px-4 py-2 text-left text-xs font-bold transition-all"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <button
          @click="copyEmail"
          class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white shadow-md transition-all hover:bg-black active:scale-95"
        >
          <span>{{ copied ? 'Copied!' : 'Copy Email Text' }}</span>
        </button>
      </div>

      <div class="lg:col-span-2">
        <div
          class="flex h-[620px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div
            class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-3"
          >
            <div class="flex gap-1.5">
              <div class="h-3 w-3 rounded-full bg-red-400"></div>
              <div class="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div class="h-3 w-3 rounded-full bg-green-400"></div>
            </div>
            <div
              class="ml-4 w-full max-w-sm truncate rounded border border-slate-200 bg-white px-3 py-0.5 text-xs text-slate-400"
            >
              Subject: {{ currentTemplate.subject }}
            </div>
          </div>

          <div
            class="prose prose-slate overflow-y-auto p-8 text-sm leading-relaxed text-slate-800 md:p-12"
          >
            <p>
              Subject: <strong>{{ currentTemplate.subject }}</strong>
            </p>
            <hr class="my-4 border-slate-100" />
            <div v-html="renderedBody"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const copied = ref(false);
const activeKey = ref('invite');

const form = reactive({
  sender: 'Alex',
  friendName: 'John',
  saas: 'RefearnApp',
  websiteUrl: 'refearn.app',
  reward: '20% lifetime discount',
});

const templateLabels = {
  invite: 'Initial Invitation',
  followup: 'Gentle Follow-up',
  success: 'Referral Success',
};

// Auto-generates the referral link based on name and website
const generatedLink = computed(() => {
  let url = form.websiteUrl.toLowerCase().replace(/^https?:\/\//, '');
  const slug = form.sender.toLowerCase().replace(/\s+/g, '-');
  return `https://${url || 'yoursite.com'}?ref=${slug || 'partner'}`;
});

const currentTemplate = computed(() => {
  const saas = form.saas || '[SaaS Name]';
  const sender = form.sender || '[Your Name]';
  const friend = form.friendName || '[Friend Name]';
  const reward = form.reward || '[Reward]';
  const link = generatedLink.value;

  const data = {
    invite: {
      subject: `Help us grow ${saas} (and get rewarded!)`,
      body: `Hi ${friend},<br><br>I'm ${sender}, founder of <strong>${saas}</strong>. We're looking to share our tools with more builders like you.<br><br>I'd love for you to join our referral program. For every person you refer, we'll give them <strong>${reward}</strong> and you'll earn a commission.<br><br>You can grab your unique link here: ${link}<br><br>Best,<br>${sender}`,
    },
    followup: {
      subject: `Quick question about ${saas}`,
      body: `Hey ${friend}!<br><br>Just following up to see if you had a chance to check out our partner program for <strong>${saas}</strong>. We've seen some great results from other partners lately.<br><br>Don't forget, your audience gets <strong>${reward}</strong> through your link: ${link}<br><br>Cheers,<br>${sender}`,
    },
    success: {
      subject: `You've got a new referral! 🚀`,
      body: `Great news ${sender}!<br><br>Someone just signed up for <strong>${saas}</strong> using your link. This means you've earned a commission and they've secured their <strong>${reward}</strong>.<br><br>Log in to your dashboard at ${link} to see your earnings.<br><br>Keep it up!<br>${sender}`,
    },
  };

  return data[activeKey.value];
});

const renderedBody = computed(() => {
  let body = currentTemplate.value.body;

  // Highlight dynamic fields in blue tint
  const fields = [
    form.saas,
    form.sender,
    form.friendName,
    form.reward,
    generatedLink.value,
  ];

  fields.forEach((field) => {
    if (field) {
      const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      body = body.replace(
        new RegExp(escapedField, 'g'),
        `<span class="bg-blue-50 text-blue-700 px-1 rounded font-bold">${field}</span>`,
      );
    }
  });

  return body;
});

const copyEmail = () => {
  const div = document.createElement('div');
  div.innerHTML = currentTemplate.value.body;
  const plainText = div.innerText;

  navigator.clipboard.writeText(
    `Subject: ${currentTemplate.value.subject}\n\n${plainText}`,
  );
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};
</script>
