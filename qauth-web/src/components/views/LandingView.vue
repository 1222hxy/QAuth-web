<script setup lang="ts">
import HeroSection from "../landing/HeroSection.vue";
import FeatureGrid from "../landing/FeatureGrid.vue";
import SecuritySection from "../landing/SecuritySection.vue";
import DeveloperSection from "../landing/DeveloperSection.vue";
import type { Lang } from "../../types";

defineProps<{ lang: Lang }>();
const emit = defineEmits<{
  navigate: [to: string];
}>();
</script>

<template>
  <HeroSection @navigate="emit('navigate', $event)" />
  <FeatureGrid />
  <SecuritySection />
  <DeveloperSection @navigate="emit('navigate', $event)" />
</template>
