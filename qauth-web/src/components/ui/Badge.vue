<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../lib/utils";
const props = defineProps<{ class?: string }>();
const classes = computed(() => cn("inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur", props.class));
</script>
<template><span :class="classes"><slot /></span></template>
