<script setup lang="ts">
import { Play } from "lucide-vue-next";
import Button from "../ui/Button.vue";
import Card from "../ui/Card.vue";
import { demoItems } from "../../content";
import type { DemoId, Lang } from "../../types";

defineProps<{ lang: Lang }>();
defineEmits<{ openDemo: [id: DemoId] }>();
</script>

<template>
  <section id="demos" class="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
    <div class="mb-8 flex flex-col justify-between gap-5 border-t border-border pt-8 lg:flex-row lg:items-end">
      <div class="max-w-2xl">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Demo experience</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">Demo 体验</h2>
      </div>
      <p class="max-w-xl text-base leading-7 text-muted-foreground">使用真实浏览器 API 和本地生成的会话数据，查看二维码登录、Passkey、领取码与实时状态流如何组合成完整认证体验。</p>
    </div>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card v-for="demo in demoItems[lang]" :key="demo.id" class="qauth-card-hover flex min-h-60 flex-col p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <span class="grid size-11 place-items-center rounded-2xl bg-secondary text-2xl">{{ demo.icon }}</span>
          <span class="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">Browser demo</span>
        </div>
        <h3 class="mt-7 text-xl font-semibold tracking-[-0.02em] text-foreground">{{ demo.title }}</h3>
        <p class="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{{ demo.desc }}</p>
        <Button variant="outline" class="mt-6 rounded-full" @click="$emit('openDemo', demo.id)"><Play :size="15" />运行</Button>
      </Card>
    </div>
  </section>
</template>
