<template>
  <section class="card h-full">
    <div class="card-body">
      <header v-if="title || $slots.header" class="mb-4 flex items-center justify-between gap-2">
        <slot name="header">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white">{{ title }}</h2>
        </slot>
      </header>
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>
