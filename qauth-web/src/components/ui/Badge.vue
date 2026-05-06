<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../lib/utils";
const props = defineProps<{ class?: string }>();
const classes = computed(() => cn("inline-flex items-center rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-zinc-100", props.class));
</script>
<template><span :class="classes"><slot /></span></template>
