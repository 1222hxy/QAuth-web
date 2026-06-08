<script setup lang="ts">
import { ArrowRight, ShieldCheck } from "lucide-vue-next";
import Button from "../ui/Button.vue";
import DemoPreview from "./DemoPreview.vue";

const emit = defineEmits<{ navigate: [to: string] }>();
</script>

<template>
  <section id="product" class="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pb-18 sm:pt-16 lg:grid-cols-[0.96fr_1.04fr] lg:px-8 lg:pb-24 lg:pt-20">
    <div class="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
      <p class="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">QAUTH / DEVICE-FIRST AUTHENTICATION ENGINE</p>
      <h1 class="mt-5 text-balance text-[clamp(2.55rem,8.6vw,5.9rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-foreground">把登录变成可信设备确认</h1>
      <p class="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 lg:mx-0">QAuth 为现代应用提供无密码认证能力。通过 Passkey、扫码确认、设备绑定与二次验证，让用户在熟悉的设备上安全完成登录。</p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
        <Button size="lg" class="group rounded-full px-5 sm:px-6" @click="emit('navigate', '/demo#demos')">进入 Demo <ArrowRight class="transition duration-200 group-hover:translate-x-0.5" :size="18" /></Button>
        <Button variant="outline" size="lg" class="rounded-full px-5 sm:px-6" @click="emit('navigate', '/#security')"><ShieldCheck :size="18" />查看安全设计</Button>
      </div>
      <div class="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-5 text-left text-xs text-muted-foreground sm:text-sm">
        <p><span class="block font-semibold text-foreground">Passkey</span>优先认证</p>
        <p><span class="block font-semibold text-foreground">QR</span>可见确认</p>
        <p><span class="block font-semibold text-foreground">Device</span>可信绑定</p>
      </div>
    </div>
    <DemoPreview />
  </section>
</template>
