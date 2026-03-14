<template>
  <article class="card h-full">
    <div class="card-body">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ label }}</p>
        <StatusBadge v-if="badgeLabel" :label="badgeLabel" :status="status" />
      </div>
      <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ value }}</p>
    </div>
  </article>
</template>

<script setup>
import StatusBadge from '@/components/common/StatusBadge.vue';

defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  badgeLabel: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'neutral',
  },
});
</script>
