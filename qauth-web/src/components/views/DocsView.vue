<script setup lang="ts">
import { CheckCircle2 } from "lucide-vue-next";
import Badge from "../ui/Badge.vue";
import Button from "../ui/Button.vue";
import Card from "../ui/Card.vue";
import { copy, docsItems } from "../../content";
import type { Lang } from "../../types";

defineProps<{ lang: Lang }>();
defineEmits<{ navigate: [to: string] }>();
</script>

<template>
  <section class="mx-auto max-w-5xl px-5 py-16 lg:px-8">
    <Badge>{{ copy[lang].sections.docs }}</Badge>
    <h1 class="mt-4 text-5xl font-black tracking-tight">QAuth Docs</h1>
    <p class="mt-4 text-lg text-zinc-600 dark:text-zinc-300">{{ copy[lang].docsDesc }}</p>
    <div class="mt-8 grid gap-4 md:grid-cols-2">
      <Card v-for="item in docsItems[lang]" :key="item" class="qauth-card-hover bg-white/75 p-6 dark:bg-white/5"><CheckCircle2 class="mb-4 text-emerald-500" />{{ item }}</Card>
    </div>
    <Button class="mt-8 rounded-2xl" @click="$emit('navigate', '/demo')">{{ copy[lang].backDemo }}</Button>
  </section>
</template>
