<template>
  <div class="relative w-full sm:w-auto">
    <button
      @click="openDemo"
      type="button"
      :disabled="isLoading"
      class="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full border border-blue-300/50 bg-blue-600/80 px-6 py-4 text-base font-bold text-white shadow-[0_0_0_4px_rgba(59,130,246,0.1),0_8px_32px_rgba(37,99,235,0.2)] backdrop-blur-md transition-all hover:border-blue-200 hover:bg-blue-600 hover:shadow-[0_0_0_6px_rgba(59,130,246,0.15),0_8px_32px_rgba(37,99,235,0.4)] active:scale-95 disabled:opacity-70 sm:w-auto md:px-10 md:py-5"
    >
      <svg
        v-if="isLoading"
        class="h-5 w-5 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>

      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-blue-100 transition-transform group-hover:scale-110"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>
      </svg>

      <span class="tracking-tight">{{
        isLoading ? 'Loading...' : 'Watch Demo'
      }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  demoId: {
    type: String,
    required: true,
  },
});

const isLoading = ref(false);

const openDemo = (e) => {
  e.preventDefault();
  isLoading.value = true;

  const demoOptions = {
    loaderColor: 'transparent',
    showLoader: false,
    width: '90%',
    maxWidth: '1100px',
    borderRadius: '24px',
  };

  if (typeof Supademo !== 'undefined') {
    Supademo.open(props.demoId, demoOptions);
    setTimeout(() => {
      isLoading.value = false;
    }, 1500);
  } else {
    window.open(`https://app.supademo.com/demo/${props.demoId}`, '_blank');
    isLoading.value = false;
  }
};
</script>
