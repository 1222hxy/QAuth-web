<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { CheckCircle2, Clock3, Laptop, ShieldCheck, Smartphone } from "lucide-vue-next";
import Badge from "../ui/Badge.vue";
import Card from "../ui/Card.vue";
import RealQrCode from "../demos/RealQrCode.vue";
import { createLoginSession } from "../../lib/qauth-demo";

const session = createLoginSession();
const steps = [
  { title: "在桌面端发起登录", meta: "Desktop challenge created", icon: Laptop },
  { title: "使用手机扫码确认", meta: "Waiting for confirmation", icon: Smartphone },
  { title: "识别可信设备", meta: "Device recognized", icon: ShieldCheck },
  { title: "登录成功", meta: "Login approved", icon: CheckCircle2 },
];
const active = ref(1);
let timer: number | undefined;

const statusText = computed(() => steps[active.value]?.meta ?? steps[1].meta);
const shortSession = computed(() => `${session.id.slice(0, 18)}…${session.id.slice(-6)}`);

onMounted(() => {
  timer = window.setInterval(() => {
    active.value = active.value >= steps.length - 1 ? 1 : active.value + 1;
  }, 2200);
});

onBeforeUnmount(() => window.clearInterval(timer));
</script>

<template>
  <Card class="qauth-card-hover overflow-hidden rounded-[1.75rem] border-border/80 bg-card/90 p-3 shadow-[0_24px_70px_hsl(var(--foreground)/0.08)] backdrop-blur sm:rounded-[2rem] sm:p-4">
    <div class="rounded-[1.35rem] border border-border bg-background/65 p-4 sm:rounded-[1.5rem] sm:p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">account.qauth.dev</p>
          <h2 class="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">QAuth Login</h2>
        </div>
        <Badge class="gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <span class="size-1.5 rounded-full bg-emerald-500 qauth-soft-pulse" /> Live browser APIs
        </Badge>
      </div>

      <div class="mt-5 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div class="rounded-[1.35rem] border border-border bg-card p-3 shadow-sm">
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>Scan challenge</span>
            <span>expires in 01:48</span>
          </div>
          <div class="mt-3 rounded-[1.1rem] border border-border bg-white p-3 dark:bg-zinc-100">
            <RealQrCode :value="session.payload" class="mx-auto size-[min(58vw,14.5rem)] rounded-xl sm:size-56" />
          </div>
          <div class="mt-3 grid grid-cols-4 gap-2">
            <span v-for="symbol in session.symbols" :key="symbol" class="grid h-10 place-items-center rounded-xl border border-border bg-secondary text-xl">{{ symbol }}</span>
          </div>
        </div>

        <div class="space-y-3">
          <div class="rounded-[1.35rem] border border-border bg-card p-4 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="grid size-10 place-items-center rounded-full bg-secondary text-foreground"><Smartphone :size="18" /></span>
                <div>
                  <p class="text-sm font-semibold text-foreground">iPhone 15 Pro</p>
                  <p class="text-xs text-muted-foreground">Trusted device · Shanghai CN</p>
                </div>
              </div>
              <span class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">verified device</span>
            </div>
            <div class="mt-4 grid gap-2 text-xs text-muted-foreground">
              <p class="flex items-center justify-between gap-3"><span>session id</span><span class="break-all font-mono text-foreground/80">{{ shortSession }}</span></p>
              <p class="flex items-center justify-between gap-3"><span>browser binding</span><span class="font-mono text-foreground/80">{{ session.browserBinding.slice(0, 12) }}</span></p>
            </div>
          </div>

          <TransitionGroup name="qauth-status" tag="ol" class="space-y-2">
            <li v-for="(step, index) in steps" :key="step.title" class="flex items-center gap-3 rounded-2xl border p-3 transition duration-300" :class="index <= active ? 'border-foreground/12 bg-secondary text-foreground' : 'border-border bg-transparent text-muted-foreground'">
              <span class="grid size-8 shrink-0 place-items-center rounded-full" :class="index <= active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'">
                <component :is="step.icon" :size="15" />
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-medium">{{ step.title }}</span>
                <span class="block text-xs text-muted-foreground">{{ step.meta }}</span>
              </span>
            </li>
          </TransitionGroup>

          <div class="flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
            <Clock3 :size="16" />
            <span>{{ statusText }}</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>
