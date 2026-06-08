<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { CheckCircle2, Copy, Fingerprint, Loader2, Play, QrCode, Server, Smartphone, X } from "lucide-vue-next";
import Button from "../ui/Button.vue";
import Card from "../ui/Card.vue";
import Dialog from "../ui/Dialog.vue";
import RealQrCode from "./RealQrCode.vue";
import { copy, demoItems } from "../../content";
import { authenticatePasskey, createClaimCode, createLoginSession, registerPasskey, solveProofOfWork } from "../../lib/qauth-demo";
import type { DemoId, Lang } from "../../types";

const props = defineProps<{
  demoId: DemoId | null;
  lang: Lang;
}>();

const emit = defineEmits<{
  close: [];
}>();

const session = ref(createLoginSession());
const claimCode = ref(createClaimCode());
const currentStep = ref(0);
const copied = ref(false);
const copyFailed = ref(false);
const busy = ref(false);
const actionResult = ref("");
const actionError = ref("");
let streamTimer: number | undefined;

const t = computed(() => copy[props.lang]);
const activeDemo = computed(() => demoItems[props.lang].find((demo) => demo.id === props.demoId) ?? null);
const dialogTitleId = computed(() => (activeDemo.value ? `demo-title-${activeDemo.value.id}` : undefined));
const isClaimCodeDemo = computed(() => props.demoId === "classicDesktop" || props.demoId === "classicMobile");
const isPasskeyDemo = computed(() => props.demoId === "register" || props.demoId === "passkeyLogin");
const activeStepLabel = computed(() => activeDemo.value?.steps[currentStep.value] ?? "");
const isFlowComplete = computed(() => Boolean(activeDemo.value && currentStep.value >= activeDemo.value.steps.length - 1));
const actionButtonLabel = computed(() => {
  if (props.demoId === "pow") return currentStep.value > 1 ? "重新计算 SHA-256" : "计算 SHA-256";
  if (isPasskeyDemo.value) return t.value.runRealAction;
  return t.value.replay;
});
const desktopStatus = computed(() => (isFlowComplete.value ? t.value.demoDesktopDone : currentStep.value >= 2 ? t.value.demoDesktopClaiming : t.value.demoDesktopWaiting));
const mobileStatus = computed(() => (currentStep.value <= 1 ? t.value.demoMobileScan : currentStep.value === 2 ? t.value.demoMobileApprove : t.value.demoMobileApproved));

watch(
  () => props.demoId,
  (id) => {
    resetDemoState(true);
    if (id && id !== "pow" && id !== "register" && id !== "passkeyLogin") window.setTimeout(playStream, 260);
  },
);

onBeforeUnmount(() => {
  clearStreamTimer();
});

function clearStreamTimer() {
  window.clearInterval(streamTimer);
  streamTimer = undefined;
}

function resetDemoState(regenerate = false) {
  currentStep.value = 0;
  copied.value = false;
  copyFailed.value = false;
  busy.value = false;
  actionResult.value = "";
  actionError.value = "";
  clearStreamTimer();

  if (regenerate) {
    session.value = createLoginSession();
    claimCode.value = createClaimCode();
  }
}

async function runActiveDemo() {
  if (!activeDemo.value || busy.value) return;
  actionError.value = "";
  actionResult.value = "";

  if (props.demoId === "pow") {
    await runProofChallenge();
    return;
  }

  if (props.demoId === "register" || props.demoId === "passkeyLogin") {
    await runPasskeyAction(props.demoId);
    return;
  }

  advanceDemo();
}

function advanceDemo() {
  playStream();
}

async function runProofChallenge() {
  busy.value = true;
  currentStep.value = 1;

  try {
    const proof = await solveProofOfWork(session.value.id, 16);
    currentStep.value = 3;
    actionResult.value = `nonce=${proof.nonce} · ${proof.attempts.toLocaleString()} hashes · ${proof.elapsedMs}ms · ${proof.hash.slice(0, 18)}…`;
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : String(error);
  } finally {
    busy.value = false;
  }
}

async function runPasskeyAction(id: "register" | "passkeyLogin") {
  busy.value = true;
  currentStep.value = 1;

  try {
    const result = id === "register" ? await registerPasskey() : await authenticatePasskey();
    currentStep.value = result.ok ? 3 : 1;
    actionResult.value = `${result.title}. ${result.detail}`;
    if (!result.ok) actionError.value = t.value.passkeyUnavailable;
  } catch (error) {
    currentStep.value = 1;
    actionError.value = error instanceof Error ? error.message : String(error);
  } finally {
    busy.value = false;
  }
}

function playStream() {
  if (!activeDemo.value) return;
  currentStep.value = 0;
  actionError.value = "";
  actionResult.value = t.value.demoRealtimeConnected.replace("{id}", session.value.id.slice(0, 16));
  clearStreamTimer();
  streamTimer = window.setInterval(() => {
    if (!activeDemo.value || currentStep.value >= activeDemo.value.steps.length - 1) {
      clearStreamTimer();
      actionResult.value = t.value.demoSessionIssued;
      return;
    }
    currentStep.value += 1;
  }, 900);
}

async function copyClaimCode() {
  copyFailed.value = false;

  try {
    await navigator.clipboard.writeText(claimCode.value);
    copied.value = true;
  } catch {
    copyFailed.value = true;
    copied.value = false;
  }
}
</script>

<template>
  <Dialog :open="demoId !== null" :labelled-by="dialogTitleId" @close="emit('close')">
    <div v-if="activeDemo" class="overflow-hidden bg-[#f7f7f4] text-[#111] dark:bg-[#111] dark:text-[#f4f4f0]">
      <div class="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-[#f7f7f4]/95 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#111]/95 md:p-5">
        <div class="flex min-w-0 items-center gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-2xl shadow-sm dark:border-white/10 dark:bg-white/10 md:size-11">{{ activeDemo.icon }}</span>
          <div class="min-w-0">
            <p class="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-neutral-500">QAuth live screen simulation</p>
            <h2 :id="dialogTitleId" class="truncate text-lg font-semibold tracking-tight md:text-xl">{{ activeDemo.title }}</h2>
          </div>
        </div>
        <Button variant="ghost" size="sm" class="rounded-full" @click="emit('close')"><X :size="16" />{{ t.close }}</Button>
      </div>

      <div class="grid gap-4 p-3 md:p-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card class="overflow-hidden border-black/10 bg-white p-3 shadow-none dark:border-white/10 dark:bg-[#171717] md:p-5">
          <div class="rounded-[1.5rem] border border-black/10 bg-[#171717] p-3 text-white dark:border-white/10 md:rounded-[2rem] md:p-5">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div class="min-w-0">
                <p class="text-xs text-neutral-400">account.qauth.dev</p>
                <p class="text-xl font-semibold tracking-tight md:text-2xl">{{ t.demoLoginTitle }}</p>
              </div>
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', isFlowComplete ? 'bg-emerald-400 text-[#111]' : 'bg-amber-300 text-[#111]']">{{ desktopStatus }}</span>
            </div>

            <div class="grid gap-4 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
              <div class="min-w-0 rounded-[1.35rem] bg-white p-3 text-[#111] md:p-4">
                <div v-if="activeDemo.id === 'pow'" class="space-y-4 p-3">
                  <div class="h-3 overflow-hidden rounded-full bg-black/10"><div :class="['h-full rounded-full bg-[#111] transition-all', busy ? 'qauth-progress' : 'w-full']" /></div>
                  <code class="block break-all rounded-2xl bg-neutral-100 p-4 text-xs leading-5">SHA-256({{ session.id }}:nonce) starts with 0000</code>
                </div>
                <div v-else-if="isPasskeyDemo" class="grid min-h-64 place-items-center rounded-[1.25rem] bg-neutral-100 p-6 text-center">
                  <Fingerprint class="text-[#111]" :size="72" />
                  <p class="mt-5 text-2xl font-semibold">WebAuthn</p>
                  <p class="mt-2 text-sm text-neutral-500">navigator.credentials {{ activeDemo.id === 'register' ? 'create()' : 'get()' }}</p>
                </div>
                <RealQrCode v-else :value="session.payload" class="mx-auto size-[min(62vw,15rem)] md:size-64" />
              </div>

              <div class="min-w-0 space-y-3">
                <div class="rounded-[1.35rem] border border-white/10 bg-white/10 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-neutral-400">{{ t.demoDesktopPanel }}</p>
                  <p class="mt-3 break-all font-mono text-xs text-neutral-300">{{ session.id }}</p>
                  <div class="mt-4 flex flex-wrap gap-2 text-2xl"><span v-for="emoji in session.symbols" :key="emoji">{{ emoji }}</span></div>
                </div>
                <div class="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-neutral-400">Event stream</p>
                  <div class="mt-3 space-y-2">
                    <div v-for="(step, index) in activeDemo.steps" :key="step" :class="['flex items-start gap-2 rounded-xl px-3 py-2 text-sm transition', index <= currentStep ? 'bg-white text-[#111]' : 'bg-white/5 text-neutral-400']">
                      <span>{{ index <= currentStep ? '●' : '○' }}</span>
                      <span class="min-w-0">{{ step }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card class="border-black/10 bg-white p-3 shadow-none dark:border-white/10 dark:bg-[#171717] md:p-5">
          <div class="mx-auto max-w-[24rem] rounded-[2rem] border border-black/10 bg-[#101010] p-3 text-white shadow-2xl dark:border-white/10">
            <div class="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/25" />
            <div class="rounded-[1.55rem] bg-[#f7f7f4] p-4 text-[#111]">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-neutral-500">QAuth Mobile</p>
                  <p class="text-lg font-semibold">{{ t.demoApproveTitle }}</p>
                </div>
                <Smartphone :size="24" />
              </div>
              <div class="mt-5 rounded-2xl border border-black/10 bg-white p-4">
                <p class="text-sm font-semibold">{{ mobileStatus }}</p>
                <p class="mt-2 text-xs leading-5 text-neutral-500">{{ activeDemo.desc }}</p>
                <div class="mt-4 rounded-xl bg-neutral-100 p-3">
                  <p class="text-[0.65rem] uppercase tracking-[0.16em] text-neutral-500">{{ t.verifySymbols }}</p>
                  <div class="mt-2 flex gap-2 text-2xl"><span v-for="emoji in session.symbols" :key="emoji">{{ emoji }}</span></div>
                </div>
              </div>

              <div v-if="isClaimCodeDemo" class="mt-4 rounded-2xl bg-[#111] p-4 text-center text-white">
                <p class="text-[0.65rem] font-semibold uppercase tracking-[0.22em] opacity-60">{{ t.claimCode }}</p>
                <p class="mt-3 select-all break-all font-mono text-2xl font-semibold tracking-widest">{{ claimCode }}</p>
                <Button variant="outline" class="mt-4 w-full rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20" @click="copyClaimCode"><Copy :size="16" />{{ copied ? t.copied : t.copyCode }}</Button>
              </div>

              <button v-else class="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#111] px-4 py-3 text-sm font-semibold text-white" type="button" @click="isPasskeyDemo || activeDemo.id === 'pow' ? runActiveDemo() : playStream()">
                <Loader2 v-if="busy" class="animate-spin" :size="16" />
                <CheckCircle2 v-else-if="isFlowComplete" :size="16" />
                <QrCode v-else :size="16" />
                {{ isFlowComplete ? t.demoApproved : actionButtonLabel }}
              </button>
            </div>
          </div>

          <div class="mt-5 rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 dark:border-white/10 dark:bg-white/5">
            <div class="mb-3 flex items-center gap-2 text-sm font-semibold"><Server :size="16" />{{ t.demoServerTruth }}</div>
            <p class="break-all font-mono text-xs leading-5 text-neutral-600 dark:text-neutral-300">payload: {{ session.payload }}</p>
            <p class="mt-2 break-all font-mono text-xs leading-5 text-neutral-600 dark:text-neutral-300">binding: {{ session.browserBinding }}</p>
          </div>

          <p v-if="copyFailed" class="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-200" role="status">{{ t.copyFailed }}</p>
          <p v-else-if="copied" class="mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-200" role="status">{{ t.copied }}</p>
          <p v-if="actionResult" class="mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-200" role="status"><CheckCircle2 class="mr-2 inline" :size="16" />{{ actionResult }}</p>
          <p v-if="actionError" class="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-200" role="status">{{ actionError }}</p>

          <div class="mt-5 grid grid-cols-2 gap-3">
            <Button class="rounded-full" :disabled="busy" @click="runActiveDemo"><Play :size="16" />{{ actionButtonLabel }}</Button>
            <Button variant="outline" class="rounded-full" @click="resetDemoState(true)">{{ t.reset }}</Button>
          </div>
          <p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">{{ t.demoNoClickHint }} <strong>{{ activeStepLabel }}</strong></p>
        </Card>
      </div>
    </div>
  </Dialog>
</template>
