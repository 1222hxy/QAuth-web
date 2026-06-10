<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { CheckCircle2, Clock3, Fingerprint, Laptop, ShieldCheck, Smartphone } from "lucide-vue-next";
import Badge from "../ui/Badge.vue";
import Card from "../ui/Card.vue";
import RealQrCode from "../demos/RealQrCode.vue";
import { createLoginSession } from "../../lib/qauth-demo";

const session = createLoginSession();
const steps = [
  { title: "在桌面端发起登录", meta: "Desktop Challenge Created", icon: Laptop },
  { title: "使用手机扫码确认", meta: "Waiting for Confirmation", icon: Smartphone },
  { title: "识别可信设备", meta: "Device Recognized", icon: ShieldCheck },
  { title: "登录成功", meta: "Login Approved", icon: CheckCircle2 },
];
const active = ref(1);
let timer: number | undefined;

const statusText = computed(() => steps[active.value]?.meta ?? steps[1].meta);
const shortSession = computed(() => `${session.id.slice(0, 14)}…${session.id.slice(-6)}`);
const qrApproved = computed(() => active.value >= 3);
const phoneFocused = computed(() => active.value >= 2);

onMounted(() => {
  timer = window.setInterval(() => {
    active.value = active.value >= steps.length - 1 ? 1 : active.value + 1;
  }, 2400);
});

onBeforeUnmount(() => window.clearInterval(timer));

function stepState(index: number) {
  if (index < active.value) return "completed";
  if (index === active.value) return "active";
  return "pending";
}
</script>

<template>
  <Card class="qauth-card-hover overflow-hidden rounded-[1.75rem] border-border/80 bg-card/90 p-3 shadow-[0_24px_70px_hsl(var(--foreground)/0.08)] backdrop-blur sm:rounded-[2rem] sm:p-4">
    <div class="rounded-[1.35rem] border border-border bg-background/65 p-4 sm:rounded-[1.5rem] sm:p-5">
      <div class="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">QAuth Workspace</p>
          <h2 class="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">QAuth Login</h2>
        </div>
        <Badge class="shrink-0 gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <span class="size-1.5 rounded-full bg-emerald-500" /> Passkey / WebAuthn
        </Badge>
      </div>

      <div class="mt-5 grid min-w-0 items-start gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="qauth-demo-panel min-w-0 overflow-hidden rounded-[1.35rem] border border-border bg-card p-3 shadow-sm transition duration-300" :class="active === 1 ? 'opacity-100 ring-1 ring-foreground/10' : 'opacity-[0.78]'">
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>Scan Challenge</span>
            <Transition name="qauth-status" mode="out-in">
              <span :key="qrApproved ? 'approved' : 'waiting'">{{ qrApproved ? 'Approved' : 'Expires in 01:48' }}</span>
            </Transition>
          </div>
          <div class="relative mt-3 overflow-hidden rounded-[1.1rem] border border-border bg-white p-3 dark:bg-zinc-100">
            <span v-if="!qrApproved" class="absolute inset-2 rounded-[0.95rem] border border-emerald-500/25" aria-hidden="true" />
            <Transition name="qauth-qr-state" mode="out-in">
              <div v-if="qrApproved" key="approved" class="mx-auto grid aspect-square w-full max-w-[9.25rem] place-items-center overflow-hidden rounded-xl bg-white text-center sm:max-w-36">
                <div>
                  <span class="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-700"><CheckCircle2 :size="24" /></span>
                  <p class="mt-3 text-sm font-semibold text-neutral-950">Verified</p>
                  <p class="mt-1 text-xs text-neutral-500">Session Approved</p>
                </div>
              </div>
              <RealQrCode v-else key="qr" :value="session.payload" class="mx-auto aspect-square w-full max-w-[9.25rem] rounded-xl sm:max-w-36" />
            </Transition>
          </div>
          <div class="mt-3 rounded-2xl border border-border bg-background/70 p-3">
            <div class="flex items-center gap-2 text-sm font-semibold"><Fingerprint :size="15" />Passkey Ready</div>
            <dl class="mt-2 grid gap-1 text-xs text-muted-foreground">
              <div class="flex min-w-0 justify-between gap-3"><dt>Method</dt><dd class="truncate font-medium text-foreground">WebAuthn</dd></div>
              <div class="flex min-w-0 justify-between gap-3"><dt>Authenticator</dt><dd class="truncate font-medium text-foreground">Platform</dd></div>
              <div class="flex min-w-0 justify-between gap-3"><dt>User Verification</dt><dd class="truncate font-medium text-foreground">Required</dd></div>
              <div class="flex min-w-0 justify-between gap-3"><dt>Status</dt><dd class="truncate font-medium text-foreground">Ready</dd></div>
            </dl>
          </div>
        </div>

        <div class="min-w-0 space-y-3">
          <div class="qauth-demo-panel rounded-[1.35rem] border border-border bg-card p-4 shadow-sm transition duration-300" :class="phoneFocused ? 'opacity-100 ring-1 ring-foreground/10' : 'opacity-75'">
            <div class="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <span class="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition duration-300" :class="phoneFocused ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : ''"><Smartphone :size="18" /></span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-foreground">iPhone 15 Pro</p>
                  <p class="truncate text-xs text-muted-foreground">Trusted Device · Shanghai CN</p>
                </div>
              </div>
              <Transition name="qauth-status" mode="out-in">
                <span :key="phoneFocused ? 'verified' : 'waiting'" class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="phoneFocused ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-secondary text-muted-foreground'">{{ phoneFocused ? 'Verified Device' : 'Waiting' }}</span>
              </Transition>
            </div>
            <div class="mt-4 grid gap-2 text-xs text-muted-foreground">
              <p class="flex min-w-0 flex-wrap items-center justify-between gap-3"><span class="shrink-0">Session ID</span><span class="min-w-0 max-w-[12rem] truncate text-right font-mono text-foreground/80" :title="session.id">{{ shortSession }}</span></p>
              <p class="flex min-w-0 flex-wrap items-center justify-between gap-3"><span class="shrink-0">Browser Binding</span><span class="min-w-0 max-w-[10rem] truncate text-right font-mono text-foreground/80" :title="session.browserBinding">{{ session.browserBinding }}</span></p>
            </div>
          </div>

          <ol class="space-y-2">
            <li v-for="(step, index) in steps" :key="step.title" class="qauth-demo-step flex items-center gap-3 rounded-2xl border p-3 transition duration-300" :class="{
              'border-emerald-500/25 bg-emerald-500/10 text-foreground shadow-sm': stepState(index) === 'active',
              'border-foreground/12 bg-secondary/70 text-foreground': stepState(index) === 'completed',
              'border-border bg-transparent text-muted-foreground opacity-[0.62]': stepState(index) === 'pending'
            }">
              <span class="grid size-8 shrink-0 place-items-center rounded-full transition duration-300" :class="stepState(index) === 'pending' ? 'bg-secondary text-muted-foreground' : 'bg-primary text-primary-foreground'">
                <component :is="step.icon" :size="15" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-medium">{{ step.title }}</span>
                <Transition name="qauth-status" mode="out-in">
                  <span :key="`${step.meta}-${stepState(index)}`" class="block text-xs text-muted-foreground">{{ stepState(index) === 'completed' ? 'Completed' : step.meta }}</span>
                </Transition>
              </span>
            </li>
          </ol>

          <div class="flex min-w-0 items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
            <Clock3 :size="16" />
            <Transition name="qauth-status" mode="out-in">
              <span :key="statusText" class="min-w-0 truncate">{{ statusText }}</span>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>
