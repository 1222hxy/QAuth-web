<script setup lang="ts">
import { Fingerprint, KeyRound, QrCode, ShieldCheck } from "lucide-vue-next";
import Badge from "../ui/Badge.vue";
import Card from "../ui/Card.vue";

const features = [
  {
    id: "passkey",
    icon: Fingerprint,
    scene: "For developer platforms",
    title: "Passkey 优先",
    desc: "以平台级密钥能力替代传统密码流程，减少凭证泄露、撞库与钓鱼风险。",
    tags: ["Passwordless", "WebAuthn", "Safer sign-in"],
  },
  {
    id: "trusted-device",
    icon: ShieldCheck,
    scene: "For internal tools",
    title: "可信设备识别",
    desc: "将设备与账户建立安全关联，在常用设备上提供更顺畅的确认体验，并为风险判断提供上下文。",
    tags: ["Trusted device", "Device binding", "Context-aware"],
  },
  {
    id: "qr-confirmation",
    icon: QrCode,
    scene: "For cross-device sign-in",
    title: "扫码确认",
    desc: "当用户在桌面端发起登录时，可在已绑定设备上完成可见确认，让跨设备登录更直观、更可控。",
    tags: ["Cross-device", "Visible approval", "Session challenge"],
  },
  {
    id: "risk-step-up",
    icon: KeyRound,
    scene: "For enterprise apps",
    title: "风险升级验证",
    desc: "在异常环境、敏感操作或高风险会话中，自动触发更严格的确认流程。",
    tags: ["Risk-based", "Step-up", "Sensitive actions"],
  },
];

const qrCells = [0, 1, 2, 4, 6, 8, 10, 13, 15, 17, 18, 20, 23, 24];
</script>

<template>
  <section id="features" class="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
    <div class="max-w-2xl">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Authentication capabilities</p>
      <h2 class="mt-3 text-balance text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl lg:text-5xl">为现代应用设计的认证能力</h2>
      <p class="mt-4 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
        QAuth 围绕真实登录链路构建，从无密码登录、设备确认到风险升级验证，为应用提供清晰、可验证、低打扰的认证体验。
      </p>
    </div>

    <div class="mt-12 grid gap-5 md:grid-cols-2">
      <Card
        v-for="feature in features"
        :key="feature.id"
        tabindex="0"
        class="group relative overflow-hidden rounded-3xl border-black/10 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/15 sm:p-7"
      >
        <div class="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/12" />
        <div class="flex items-start justify-between gap-4">
          <Badge class="border-black/10 bg-white/50 text-neutral-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300">{{ feature.scene }}</Badge>
          <span class="grid size-10 shrink-0 place-items-center rounded-2xl border border-black/10 bg-white/60 text-neutral-800 transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/80 dark:border-white/10 dark:bg-black/20 dark:text-zinc-100 dark:group-hover:bg-white/[0.06]">
            <component :is="feature.icon" :size="18" />
          </span>
        </div>

        <div class="mt-7 max-w-xl">
          <h3 class="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">{{ feature.title }}</h3>
          <p class="mt-3 text-sm leading-6 text-neutral-600 dark:text-zinc-400 sm:text-[0.95rem]">{{ feature.desc }}</p>
        </div>

        <div class="mt-6 rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/80 dark:border-white/10 dark:bg-black/20 dark:shadow-none dark:group-hover:bg-white/[0.035]">
          <div v-if="feature.id === 'passkey'" class="space-y-3">
            <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-3 dark:border-white/10">
              <span class="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 dark:text-zinc-500">Authentication method</span>
              <span class="rounded-full border border-black/10 bg-neutral-100/70 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">Passkey</span>
            </div>
            <div class="grid gap-3 text-sm">
              <p class="flex items-center justify-between gap-4"><span class="text-neutral-500 dark:text-zinc-500">Device</span><span class="font-medium text-neutral-900 dark:text-zinc-100">This MacBook</span></p>
              <p class="flex items-center justify-between gap-4"><span class="text-neutral-500 dark:text-zinc-500">Status</span><span class="inline-flex items-center gap-2 font-medium text-neutral-900 dark:text-zinc-100"><span class="size-1.5 rounded-full bg-neutral-700 dark:bg-zinc-300" />Ready</span></p>
            </div>
          </div>

          <div v-else-if="feature.id === 'trusted-device'" class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="relative grid h-14 w-10 place-items-center rounded-[1rem] border border-black/10 bg-neutral-100/80 dark:border-white/10 dark:bg-white/[0.04]">
                <span class="absolute top-1.5 h-0.5 w-3 rounded-full bg-neutral-300 dark:bg-zinc-600" />
                <span class="size-2 rounded-full bg-neutral-700 dark:bg-zinc-300" />
              </span>
              <div>
                <p class="text-xs text-neutral-500 dark:text-zinc-500">Device recognized</p>
                <p class="mt-1 text-sm font-semibold text-neutral-950 dark:text-neutral-50">iPhone 15 Pro</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-xl border border-black/10 bg-neutral-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]"><p class="text-xs text-neutral-500 dark:text-zinc-500">Last verified</p><p class="mt-1 font-medium text-neutral-900 dark:text-zinc-100">2 min ago</p></div>
              <div class="rounded-xl border border-black/10 bg-neutral-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]"><p class="text-xs text-neutral-500 dark:text-zinc-500">Trust level</p><p class="mt-1 inline-flex items-center gap-2 font-medium text-neutral-900 dark:text-zinc-100"><span class="size-1.5 rounded-full bg-neutral-700 dark:bg-zinc-300" />Trusted</p></div>
            </div>
          </div>

          <div v-else-if="feature.id === 'qr-confirmation'" class="grid gap-4 sm:grid-cols-[5rem_1fr]">
            <div class="grid size-20 grid-cols-5 gap-1 rounded-xl border border-black/10 bg-neutral-50/80 p-2 dark:border-white/10 dark:bg-white/[0.03]">
              <span v-for="cell in 25" :key="cell" class="rounded-[0.18rem]" :class="qrCells.includes(cell - 1) ? 'bg-neutral-800 dark:bg-zinc-200' : 'bg-transparent'" />
            </div>
            <div class="min-w-0 space-y-2 text-sm">
              <p class="flex items-center justify-between gap-3"><span class="text-neutral-500 dark:text-zinc-500">Session ID</span><span class="font-mono font-medium text-neutral-900 dark:text-zinc-100">qa_7K92M4</span></p>
              <p class="flex items-center justify-between gap-3"><span class="text-neutral-500 dark:text-zinc-500">Expires in</span><span class="font-medium text-neutral-900 dark:text-zinc-100">02:58</span></p>
              <p class="flex items-center justify-between gap-3"><span class="text-neutral-500 dark:text-zinc-500">Status</span><span class="inline-flex items-center gap-2 font-medium text-neutral-900 dark:text-zinc-100"><span class="size-1.5 rounded-full bg-neutral-700 qauth-soft-pulse dark:bg-zinc-300" />Waiting for approval</span></p>
            </div>
          </div>

          <div v-else class="space-y-3 text-sm">
            <div class="rounded-xl border border-black/10 bg-neutral-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
              <p class="flex items-center justify-between gap-4"><span class="text-neutral-500 dark:text-zinc-500">Risk score</span><span class="rounded-full border border-black/10 bg-neutral-100/80 px-2.5 py-1 text-xs font-medium text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200">Elevated</span></p>
            </div>
            <p class="flex items-center justify-between gap-4"><span class="text-neutral-500 dark:text-zinc-500">Action</span><span class="font-medium text-neutral-900 dark:text-zinc-100">Require confirmation</span></p>
            <p class="flex items-center justify-between gap-4"><span class="text-neutral-500 dark:text-zinc-500">Result</span><span class="inline-flex items-center gap-2 font-medium text-neutral-900 dark:text-zinc-100"><span class="size-1.5 rounded-full bg-neutral-500 dark:bg-zinc-400" />Pending</span></p>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-2">
          <span v-for="tag in feature.tags" :key="tag" class="inline-flex items-center rounded-full border border-black/10 bg-white/45 px-2.5 py-1 text-xs font-medium text-neutral-600 transition duration-300 group-hover:bg-white/70 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:group-hover:bg-white/[0.055]">
            {{ tag }}
          </span>
        </div>
      </Card>
    </div>
  </section>
</template>
