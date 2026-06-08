<script setup lang="ts">
import { CheckCircle2 } from "lucide-vue-next";
import Badge from "../ui/Badge.vue";
import Card from "../ui/Card.vue";
import { copy, roadmap } from "../../content";
import type { Lang } from "../../types";

defineProps<{ lang: Lang }>();
</script>

<template>
  <section class="mx-auto max-w-6xl px-5 py-16 lg:px-8">
    <Badge>{{ copy[lang].sections.roadmap }}</Badge>
    <h1 class="mt-4 text-5xl font-black tracking-tight">{{ copy[lang].sections.roadmap }}</h1>
    <div class="mt-8 grid gap-5 md:grid-cols-3">
      <Card v-for="column in roadmap[lang]" :key="column.title" class="border-white/80 bg-white/75 p-6 dark:border-white/10 dark:bg-white/5">
        <h2 class="text-2xl font-black">{{ column.title }}</h2>
        <ul class="mt-5 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
          <li v-for="item in column.items" :key="item" class="flex gap-2"><CheckCircle2 class="mt-0.5 shrink-0 text-emerald-500" :size="17" />{{ item }}</li>
        </ul>
      </Card>
    </div>
  </section>
</template>
