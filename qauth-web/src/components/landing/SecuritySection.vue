<script setup lang="ts">
import { CheckCircle2, LockKeyhole } from "lucide-vue-next";
import Card from "../ui/Card.vue";

const controls = ["设备绑定", "短时效挑战", "防重放", "用户可见确认", "风险场景二次验证"];
</script>

<template>
  <section id="security" class="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
    <Card class="overflow-hidden bg-foreground p-6 text-background shadow-[0_28px_90px_hsl(var(--foreground)/0.14)] dark:bg-card dark:text-foreground lg:p-10">
      <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p class="inline-flex items-center gap-2 rounded-full border border-background/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-background/70 dark:border-border dark:text-muted-foreground"><LockKeyhole :size="14" /> Security design</p>
          <h2 class="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">安全设计</h2>
          <p class="mt-5 max-w-xl text-base leading-7 text-background/70 dark:text-muted-foreground">QAuth 将挑战、设备、浏览器与用户确认绑定在同一个短时会话中。二维码不携带令牌，授权不可被重复使用，敏感场景始终要求用户在可信设备上重新确认。</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div v-for="item in controls" :key="item" class="qauth-card-hover rounded-2xl border border-background/12 bg-background/6 p-5 dark:border-border dark:bg-secondary/60">
            <CheckCircle2 class="text-emerald-400" :size="20" />
            <p class="mt-5 text-lg font-semibold">{{ item }}</p>
            <p class="mt-2 text-sm leading-6 text-background/62 dark:text-muted-foreground">用于降低凭证泄露、二维码转发、会话重放与异常环境登录带来的风险。</p>
          </div>
        </div>
      </div>
    </Card>
  </section>
</template>
