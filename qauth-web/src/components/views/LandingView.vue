<script setup lang="ts">
import HeroSection from "../landing/HeroSection.vue";
import FeatureGrid from "../landing/FeatureGrid.vue";
import SecuritySection from "../landing/SecuritySection.vue";
import DeveloperSection from "../landing/DeveloperSection.vue";
import DemoShowcase from "../landing/DemoShowcase.vue";
import type { DemoId, Lang } from "../../types";

defineProps<{ lang: Lang }>();
const emit = defineEmits<{
  navigate: [to: string];
  openDemo: [id: DemoId];
}>();
</script>

<template>
  <HeroSection @navigate="emit('navigate', $event)" />
  <FeatureGrid />
  <SecuritySection />
  <DeveloperSection @navigate="emit('navigate', $event)" />
  <DemoShowcase :lang="lang" @open-demo="emit('openDemo', $event)" />
</template>
