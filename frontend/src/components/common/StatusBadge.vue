<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
    :class="badgeClass"
  >
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'neutral',
    validator: (value) => ['positive', 'negative', 'neutral'].includes(value),
  },
});

const badgeClass = computed(() => {
  if (props.status === 'positive') {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  }

  if (props.status === 'negative') {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  }

  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
});
</script>
