<script setup lang="ts">
import { ArrowRight, CheckCircle2, Play, ShieldCheck, Smartphone, Sparkles } from "lucide-vue-next";
import Badge from "../ui/Badge.vue";
import Button from "../ui/Button.vue";
import Card from "../ui/Card.vue";
import RealQrCode from "../demos/RealQrCode.vue";
import { capabilities, copy, demoItems, flow, QR_LOGIN_PAYLOAD } from "../../content";
import type { DemoId, Lang } from "../../types";

const props = defineProps<{
  lang: Lang;
}>();

const emit = defineEmits<{
  navigate: [to: string];
  openDemo: [id: DemoId];
}>();
</script>

<template>
  <template v-if="props.lang">
    <section id="position" class="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
      <div>
        <Badge class="mb-5 gap-2"><Sparkles :size="14" />{{ copy[lang].badge }}</Badge>
        <h1 class="text-5xl font-black tracking-tight md:text-7xl">
          {{ copy[lang].heroA }}
          <span class="block bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">{{ copy[lang].heroB }}</span>
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">{{ copy[lang].heroDesc }}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <Button size="lg" class="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 shadow-xl shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500" @click="emit('navigate', '/demo#demos')">{{ copy[lang].cta1 }}<ArrowRight :size="18" /></Button>
          <Button variant="outline" size="lg" class="rounded-2xl bg-white/70 dark:bg-white/5" @click="emit('navigate', '/security')"><ShieldCheck :size="18" />{{ copy[lang].cta2 }}</Button>
        </div>
        <div class="mt-8 grid max-w-2xl gap-3 sm:grid-cols-4">
          <div v-for="item in [copy[lang].trusted, copy[lang].qr, copy[lang].passkey, copy[lang].live]" :key="item" class="rounded-2xl border border-zinc-200/80 bg-white/70 p-3 text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-white/5">
            <CheckCircle2 class="mb-2 text-emerald-500" :size="18" />{{ item }}
          </div>
        </div>
      </div>

      <Card class="relative overflow-hidden border-white/80 bg-white/80 p-5 shadow-2xl shadow-sky-500/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div class="absolute right-8 top-8 h-24 w-24 rounded-full bg-sky-400/30 blur-3xl" />
        <div class="rounded-[2rem] bg-zinc-950 p-5 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm text-zinc-300"><span class="size-3 rounded-full bg-red-400" /><span class="size-3 rounded-full bg-amber-400" /><span class="size-3 rounded-full bg-emerald-400" /></div>
            <Badge class="border-white/10 bg-white/10 text-white">Live</Badge>
          </div>
          <div class="mt-6 grid gap-4 md:grid-cols-[0.8fr_1fr]">
            <div class="rounded-3xl bg-white p-4"><RealQrCode :value="QR_LOGIN_PAYLOAD" class="h-56" /></div>
            <div class="space-y-4">
              <div class="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                <Smartphone class="text-sky-300" />
                <p class="mt-4 text-2xl font-black">Banana Workspace</p>
                <p class="mt-2 text-sm text-zinc-300">Chrome on macOS · Singapore</p>
              </div>
              <div class="rounded-3xl bg-emerald-400/15 p-5 text-emerald-100 ring-1 ring-emerald-300/20">
                <p class="text-sm font-semibold">Approval symbols</p>
                <p class="mt-3 text-3xl">🦊 🌙 🚀 🍒</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>

    <section id="capabilities" class="mx-auto max-w-7xl scroll-mt-28 px-5 py-10 lg:px-8">
      <div class="mb-8 max-w-2xl">
        <Badge>{{ copy[lang].nav.capabilities }}</Badge>
        <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">{{ copy[lang].sections.capabilities }}</h2>
        <p class="mt-3 text-zinc-600 dark:text-zinc-300">{{ copy[lang].sections.capabilitiesDesc }}</p>
      </div>
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card v-for="item in capabilities[lang]" :key="item.title" class="qauth-card-hover border-white/80 bg-white/75 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <component :is="item.icon" class="text-sky-500" :size="30" />
          <h3 class="mt-5 text-xl font-bold">{{ item.title }}</h3>
          <p class="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ item.desc }}</p>
        </Card>
      </div>
    </section>

    <section id="flow" class="mx-auto max-w-7xl scroll-mt-28 px-5 py-8 lg:px-8">
      <Card class="overflow-hidden border-white/80 bg-zinc-950 text-white shadow-2xl shadow-slate-400/20 dark:border-white/10">
        <div class="grid gap-8 p-7 md:grid-cols-[0.8fr_1.2fr] md:p-10">
          <div>
            <Badge class="border-white/15 bg-white/10 text-white">{{ copy[lang].nav.flow }}</Badge>
            <h2 class="mt-4 text-3xl font-black tracking-tight">{{ copy[lang].sections.flow }}</h2>
            <p class="mt-3 text-zinc-300">{{ copy[lang].sections.flowDesc }}</p>
          </div>
          <div class="space-y-3">
            <div v-for="(step, index) in flow[lang]" :key="step" class="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <span class="grid size-9 shrink-0 place-items-center rounded-full bg-sky-400 font-black text-zinc-950">{{ index + 1 }}</span>
              <span class="font-medium">{{ step }}</span>
            </div>
          </div>
        </div>
      </Card>
    </section>

    <section id="demos" class="mx-auto max-w-7xl scroll-mt-28 px-5 py-10 lg:px-8">
      <div class="mb-7">
        <Badge>{{ copy[lang].nav.demos }}</Badge>
        <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">{{ copy[lang].sections.demo }}</h2>
      </div>
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <button v-for="demo in demoItems[lang]" :key="demo.id" class="group text-left" @click="emit('openDemo', demo.id)">
          <Card class="qauth-card-hover h-full overflow-hidden border-white/80 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div :class="['h-2 bg-gradient-to-r', demo.accent]" />
            <div class="p-6">
              <div class="mb-5 flex items-center justify-between">
                <span class="text-4xl">{{ demo.icon }}</span>
                <span class="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500 transition group-hover:bg-zinc-950 group-hover:text-white dark:bg-white/10 dark:text-zinc-300">{{ copy[lang].openDemo }}</span>
              </div>
              <h3 class="text-xl font-black">{{ demo.title }}</h3>
              <p class="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ demo.desc }}</p>
            </div>
          </Card>
        </button>
      </div>
    </section>
  </template>
</template>
