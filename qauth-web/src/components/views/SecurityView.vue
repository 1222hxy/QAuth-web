<script setup lang="ts">
import { LockKeyhole, ShieldCheck } from "lucide-vue-next";
import Badge from "../ui/Badge.vue";
import Card from "../ui/Card.vue";
import { copy, protections } from "../../content";
import type { Lang } from "../../types";

defineProps<{ lang: Lang }>();
</script>

<template>
  <section class="mx-auto max-w-6xl px-5 py-16 lg:px-8">
    <Badge><LockKeyhole :size="14" /> {{ copy[lang].sections.security }}</Badge>
    <h1 class="mt-4 text-5xl font-black tracking-tight">{{ copy[lang].sections.security }}</h1>
    <div class="mt-8 grid gap-4 md:grid-cols-2">
      <Card v-for="item in protections[lang]" :key="item" class="qauth-card-hover border-white/80 bg-white/75 p-6 dark:border-white/10 dark:bg-white/5">
        <ShieldCheck class="mb-4 text-sky-500" />
        <p class="font-semibold">{{ item }}</p>
      </Card>
    </div>
  </section>
</template>
