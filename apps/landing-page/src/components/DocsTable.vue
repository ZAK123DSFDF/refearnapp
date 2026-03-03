<template>
  <div
    class="border-border bg-card my-6 w-full overflow-hidden rounded-xl border shadow-sm"
  >
    <div class="border-border bg-muted/30 flex border-b p-1">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        @click="activeTab = index"
        :class="[
          'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all',
          activeTab === index
            ? 'bg-background text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        ]"
      >
        {{ tab }}
      </button>
    </div>

    <div class="text-muted-foreground p-6 text-sm leading-relaxed">
      <div v-for="(tab, index) in tabs" :key="index">
        <slot :name="'tab-' + index" v-if="activeTab === index" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
});

const activeTab = ref(0);
</script>
