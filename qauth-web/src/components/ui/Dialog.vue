<script setup lang="ts">
defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();
</script>
<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-zinc-950/70 p-4 backdrop-blur" @click.self="$emit('close')">
      <div class="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-[2rem] bg-white shadow-2xl dark:bg-zinc-950">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
