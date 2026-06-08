<script setup lang="ts">
import { Monitor, Moon, Sun } from "lucide-vue-next";
import Button from "../ui/Button.vue";

const props = defineProps<{ mode: "light" | "dark" | "system" }>();
const emit = defineEmits<{ "update:mode": [mode: "light" | "dark" | "system"] }>();

const order = ["system", "light", "dark"] as const;

function nextMode() {
  const index = order.indexOf(props.mode);
  emit("update:mode", order[(index + 1) % order.length]);
}
</script>

<template>
  <Button variant="ghost" size="sm" class="group rounded-full px-3 text-muted-foreground hover:text-foreground" :aria-label="`Theme: ${mode}`" @click="nextMode">
    <Monitor v-if="mode === 'system'" :size="16" />
    <Sun v-else-if="mode === 'light'" :size="16" />
    <Moon v-else :size="16" />
    <span class="hidden text-xs sm:inline">{{ mode === "system" ? "System" : mode === "light" ? "Light" : "Dark" }}</span>
  </Button>
</template>
