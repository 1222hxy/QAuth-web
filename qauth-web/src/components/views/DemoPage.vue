<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Check, ChevronDown, Circle, Laptop, Pause, Play, RotateCcw, ShieldCheck, Smartphone } from "lucide-vue-next";
import Button from "../ui/Button.vue";
import Card from "../ui/Card.vue";
import RealQrCode from "../demos/RealQrCode.vue";
import { copy } from "../../content";
import { createLoginSession } from "../../lib/qauth-demo";
import type { Lang } from "../../types";

type DemoMode = "standard" | "mobile" | "device" | "proof";
type DemoStep = {
  id: string;
  title: string;
  description: string;
  status: string;
};

const props = defineProps<{ lang: Lang }>();
const emit = defineEmits<{ navigate: [to: string] }>();

const session = createLoginSession();
const activeMode = ref<DemoMode>("standard");
const activeStep = ref(0);
const isPlaying = ref(false);
const showDetails = ref(false);
const prefersReducedMotion = ref(false);
let playTimer: number | undefined;
let reducedMotionQuery: MediaQueryList | null = null;

const t = computed(() => copy[props.lang]);
const demoCopy = computed(() => t.value.demoPage);
const modes = computed(() => demoCopy.value.modes);
const currentMode = computed(() => modes.value.find((mode) => mode.id === activeMode.value) ?? modes.value[0]);
const currentSteps = computed<readonly DemoStep[]>(() => demoCopy.value.steps[activeMode.value]);
const currentStep = computed(() => currentSteps.value[activeStep.value] ?? currentSteps.value[0]);
const progress = computed(() => (currentSteps.value.length <= 1 ? 100 : (activeStep.value / (currentSteps.value.length - 1)) * 100));
const isComplete = computed(() => activeStep.value >= currentSteps.value.length - 1);
const proofAttempts = computed(() => [0, 12480, 482910, 482910, 482910][Math.min(activeStep.value, 4)] ?? 482910);
const proofStatus = computed(() => (activeMode.value === "proof" && activeStep.value >= 2 ? demoCopy.value.proof.found : demoCopy.value.proof.active));
const shortBinding = computed(() => `${session.browserBinding.slice(0, 4)}…${session.browserBinding.slice(-4)}`);

onMounted(() => {
  reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion.value = reducedMotionQuery.matches;
  reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
});

onBeforeUnmount(() => {
  clearPlayTimer();
  reducedMotionQuery?.removeEventListener("change", handleMotionPreferenceChange);
});

watch(activeMode, () => {
  resetDemo();
  showDetails.value = false;
});

watch(isPlaying, (playing) => {
  clearPlayTimer();
  if (!playing || prefersReducedMotion.value) {
    if (prefersReducedMotion.value) isPlaying.value = false;
    return;
  }

  playTimer = window.setInterval(() => {
    if (isComplete.value) {
      isPlaying.value = false;
      clearPlayTimer();
      return;
    }
    nextStep();
  }, 1800);
});

function handleMotionPreferenceChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches;
  if (event.matches) {
    isPlaying.value = false;
    clearPlayTimer();
  }
}

function clearPlayTimer() {
  window.clearInterval(playTimer);
  playTimer = undefined;
}

function selectMode(mode: DemoMode) {
  activeMode.value = mode;
}

function nextStep() {
  activeStep.value = Math.min(activeStep.value + 1, currentSteps.value.length - 1);
  if (isComplete.value) isPlaying.value = false;
}

function prevStep() {
  activeStep.value = Math.max(activeStep.value - 1, 0);
}

function resetDemo() {
  activeStep.value = 0;
  isPlaying.value = false;
  clearPlayTimer();
}

function togglePlayback() {
  if (isComplete.value) activeStep.value = 0;
  isPlaying.value = !isPlaying.value;
}
</script>

<template>
  <section class="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
    <div class="mb-10 flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl">
        <button class="mb-5 text-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground" type="button" @click="emit('navigate', '/')">{{ demoCopy.backHome }}</button>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">QAuth Demo</p>
        <h1 class="mt-4 text-balance text-[clamp(2.6rem,7vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.065em] text-foreground">{{ demoCopy.title }}</h1>
      </div>
      <p class="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{{ demoCopy.subtitle }}</p>
    </div>

    <div class="mb-7 overflow-x-auto pb-1">
      <div class="inline-grid min-w-full grid-cols-2 gap-1 rounded-full border border-border bg-secondary/50 p-1 sm:min-w-0 sm:grid-cols-4">
        <button
          v-for="mode in modes"
          :key="mode.id"
          type="button"
          :class="[
            'rounded-full px-4 py-2.5 text-sm font-medium transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            activeMode === mode.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          ]"
          @click="selectMode(mode.id)"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <Card class="overflow-hidden border-border/80 bg-card/92 shadow-[0_18px_60px_hsl(var(--foreground)/0.06)]">
      <div class="grid gap-0 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <aside class="min-w-0 border-b border-border p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ currentMode.label }}</p>
          <Transition name="qauth-demo-fade" mode="out-in">
            <div :key="currentStep.id" class="mt-6">
              <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <span class="size-1.5 rounded-full bg-foreground/55" />{{ currentStep.status }}
              </div>
              <h2 class="text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-3xl">{{ currentStep.title }}</h2>
              <p class="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{{ currentStep.description }}</p>
            </div>
          </Transition>

          <div class="mt-8 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div class="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out" :style="{ width: `${progress}%` }" />
          </div>

          <div class="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" class="rounded-full" :disabled="activeStep === 0" @click="prevStep">{{ demoCopy.controls.prev }}</Button>
            <Button variant="outline" class="rounded-full" :disabled="isComplete" @click="nextStep">{{ demoCopy.controls.next }}</Button>
            <Button class="rounded-full" @click="togglePlayback">
              <Pause v-if="isPlaying" :size="16" />
              <Play v-else :size="16" />
              {{ isPlaying ? demoCopy.controls.pause : demoCopy.controls.play }}
            </Button>
            <Button variant="ghost" class="rounded-full" @click="resetDemo"><RotateCcw :size="16" />{{ demoCopy.controls.reset }}</Button>
          </div>
        </aside>

        <div class="min-w-0 bg-background/45 p-4 sm:p-6 lg:p-8">
          <Transition name="qauth-demo-fade" mode="out-in">
            <div v-if="activeMode === 'proof'" :key="`proof-${activeStep}`" class="grid min-w-0 gap-4 md:grid-cols-3">
              <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ demoCopy.proof.challenge }}</p>
                <dl class="mt-5 space-y-3 text-sm">
                  <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Challenge ID</dt><dd class="min-w-0 truncate font-mono" :title="demoCopy.details.challengeId">{{ demoCopy.details.challengeId }}</dd></div>
                  <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Difficulty</dt><dd class="font-medium">0000 Prefix</dd></div>
                  <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Expires In</dt><dd class="font-medium">02:58</dd></div>
                  <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Status</dt><dd class="font-medium">{{ proofStatus }}</dd></div>
                </dl>
              </div>

              <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ demoCopy.proof.progress }}</p>
                <dl class="mt-5 space-y-3 text-sm">
                  <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Searching Nonce</dt><dd class="font-medium">{{ activeStep >= 1 ? 'Active' : 'Pending' }}</dd></div>
                  <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Attempts</dt><dd class="font-mono">{{ proofAttempts.toLocaleString() }}</dd></div>
                  <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Current Hash</dt><dd class="min-w-0 truncate font-mono" title="8f9a19c420fae2934475bbd103be">8f9a…03be</dd></div>
                </dl>
                <div class="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary"><div class="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out" :style="{ width: `${activeStep >= 2 ? 100 : activeStep >= 1 ? 54 : 8}%` }" /></div>
              </div>

              <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ demoCopy.proof.result }}</p>
                <div class="mt-5 grid place-items-start gap-4">
                  <span class="grid size-10 place-items-center rounded-full border border-border bg-secondary"><Check :size="18" /></span>
                  <dl class="w-full space-y-3 text-sm">
                    <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Proof Found</dt><dd class="font-medium">{{ activeStep >= 2 ? 'Yes' : 'Pending' }}</dd></div>
                    <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Nonce</dt><dd class="font-mono">{{ activeStep >= 2 ? '482910' : '—' }}</dd></div>
                    <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Verification</dt><dd class="font-medium">{{ activeStep >= 3 ? 'Passed' : 'Pending' }}</dd></div>
                    <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Continue Authentication</dt><dd class="font-medium">{{ activeStep >= 4 ? 'Ready' : 'Waiting' }}</dd></div>
                  </dl>
                </div>
              </div>
            </div>

            <div v-else :key="`auth-${activeMode}-${activeStep}`" class="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <div class="mb-4 flex min-w-0 items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">account.qauth.dev</p>
                    <h3 class="mt-2 text-xl font-semibold tracking-[-0.025em]">{{ demoCopy.desktop.title }}</h3>
                  </div>
                  <Laptop class="shrink-0 text-muted-foreground" :size="21" />
                </div>
                <div class="rounded-2xl border border-border bg-background p-4 text-center">
                  <p class="text-sm font-medium">{{ demoCopy.desktop.scan }}</p>
                  <RealQrCode :value="session.payload" class="mx-auto mt-4 size-32 max-w-full rounded-xl bg-white p-1 sm:size-36" />
                </div>
                <dl class="mt-4 space-y-2 text-sm">
                  <div class="flex min-w-0 items-center justify-between gap-3"><dt class="shrink-0 text-muted-foreground">Session ID</dt><dd class="min-w-0 truncate font-mono" :title="session.id">{{ demoCopy.details.sessionId }}</dd></div>
                  <div class="flex min-w-0 items-center justify-between gap-3"><dt class="shrink-0 text-muted-foreground">Expires In</dt><dd class="font-medium">02:58</dd></div>
                  <div class="flex min-w-0 items-center justify-between gap-3"><dt class="shrink-0 text-muted-foreground">Status</dt><dd class="min-w-0 truncate font-medium">{{ activeStep >= 5 ? 'Session Verified' : activeStep >= 3 ? 'Approved' : 'Waiting for Approval' }}</dd></div>
                </dl>
              </div>

              <div class="grid min-w-0 gap-4 sm:grid-cols-2">
                <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                  <div class="flex items-center justify-between gap-3">
                    <h3 class="text-lg font-semibold tracking-[-0.02em]">{{ demoCopy.mobile.title }}</h3>
                    <Smartphone class="text-muted-foreground" :size="20" />
                  </div>
                  <div class="mt-4 rounded-2xl border border-border bg-background p-4">
                    <p class="text-sm font-semibold">Confirm Sign-in</p>
                    <dl class="mt-4 space-y-2 text-sm">
                      <div class="flex justify-between gap-3"><dt class="text-muted-foreground">App</dt><dd class="font-medium">QAuth Workspace</dd></div>
                      <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Browser</dt><dd class="font-medium">Chrome</dd></div>
                      <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Device</dt><dd class="font-medium">iPhone</dd></div>
                      <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Location</dt><dd class="font-medium">Shanghai CN</dd></div>
                    </dl>
                    <div class="mt-4 grid grid-cols-2 gap-2"><button class="rounded-full bg-foreground px-3 py-2 text-sm font-medium text-background">Approve</button><button class="rounded-full border border-border px-3 py-2 text-sm font-medium text-muted-foreground">Deny</button></div>
                  </div>
                </div>

                <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                  <div class="flex items-center justify-between gap-3">
                    <h3 class="text-lg font-semibold tracking-[-0.02em]">{{ demoCopy.device.title }}</h3>
                    <ShieldCheck class="text-muted-foreground" :size="20" />
                  </div>
                  <dl class="mt-5 space-y-3 text-sm">
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Device</dt><dd class="font-medium">iPhone 15 Pro</dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Trust</dt><dd class="font-medium">Trusted Device</dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Last Verified</dt><dd class="font-medium">2 min ago</dd></div>
                    <div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 text-muted-foreground">Browser Binding</dt><dd class="min-w-0 truncate font-mono" :title="session.browserBinding">{{ shortBinding }}</dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Device Status</dt><dd class="font-medium">Verified</dd></div>
                  </dl>
                </div>

                <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:col-span-2 sm:p-5">
                  <div class="flex min-w-0 items-center gap-4">
                    <span class="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary"><Check :size="18" /></span>
                    <div class="min-w-0">
                      <h3 class="truncate text-lg font-semibold tracking-[-0.02em]">Session Verified</h3>
                      <p class="mt-1 truncate text-sm text-muted-foreground">Approved on Trusted Device</p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap items-center gap-2 text-sm"><span class="rounded-full border border-border px-3 py-1 text-muted-foreground">Verification Complete</span><span class="rounded-full bg-foreground px-3 py-1 font-medium text-background">Continue to Workspace</span></div>
                </div>
              </div>
            </div>
          </Transition>

          <ol class="mt-6 grid gap-2 border-t border-border pt-5 md:grid-cols-3 xl:grid-cols-6">
            <li v-for="(step, index) in currentSteps" :key="step.id" class="min-w-0 rounded-2xl border p-3 transition duration-300 ease-out" :class="index === activeStep ? 'border-foreground/20 bg-card text-foreground' : index < activeStep ? 'border-border bg-secondary/60 text-foreground' : 'border-border bg-transparent text-muted-foreground opacity-70'">
              <div class="mb-2 flex items-center gap-2"><Check v-if="index < activeStep" :size="14" /><Circle v-else :size="12" /><span class="text-xs font-medium">{{ index + 1 }}</span></div>
              <p class="truncate text-sm font-medium" :title="step.status">{{ step.status }}</p>
            </li>
          </ol>
        </div>
      </div>
    </Card>

    <div class="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-5">
      <button class="flex w-full items-center justify-between gap-4 text-left" type="button" @click="showDetails = !showDetails">
        <span class="font-medium text-foreground">{{ showDetails ? demoCopy.details.hide : demoCopy.details.view }}</span>
        <ChevronDown :class="['shrink-0 transition duration-200', showDetails ? 'rotate-180' : '']" :size="18" />
      </button>
      <Transition name="qauth-details">
        <div v-if="showDetails" class="mt-5 grid gap-3 border-t border-border pt-5 text-sm md:grid-cols-2 lg:grid-cols-5">
          <div class="min-w-0"><p class="text-muted-foreground">Session ID</p><p class="mt-1 truncate font-mono" :title="session.id">{{ session.id }}</p></div>
          <div class="min-w-0"><p class="text-muted-foreground">Challenge ID</p><p class="mt-1 truncate font-mono" :title="demoCopy.details.challengeId">{{ demoCopy.details.challengeId }}</p></div>
          <div class="min-w-0"><p class="text-muted-foreground">Browser Binding</p><p class="mt-1 truncate font-mono" :title="session.browserBinding">{{ session.browserBinding }}</p></div>
          <div class="min-w-0"><p class="text-muted-foreground">Device Key</p><p class="mt-1 truncate font-mono" :title="demoCopy.details.deviceKey">{{ demoCopy.details.deviceKey }}</p></div>
          <div class="min-w-0"><p class="text-muted-foreground">Proof Status</p><p class="mt-1 truncate font-medium">{{ proofStatus }}</p></div>
        </div>
      </Transition>
    </div>
  </section>
</template>
