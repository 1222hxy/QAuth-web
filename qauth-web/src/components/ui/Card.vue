<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../lib/utils";
const props = defineProps<{ class?: string }>();
const classes = computed(() => cn("rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950", props.class));
</script>
<template><section :class="classes"><slot /></section></template>
