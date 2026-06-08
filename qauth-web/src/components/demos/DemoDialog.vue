<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Copy, Fingerprint, Smartphone, X } from "lucide-vue-next";
import Button from "../ui/Button.vue";
import Card from "../ui/Card.vue";
import Dialog from "../ui/Dialog.vue";
import RealQrCode from "./RealQrCode.vue";
import { CLAIM_CODE, copy, demoItems, QR_LOGIN_PAYLOAD, VERIFY_EMOJIS } from "../../content";
import type { DemoId, Lang } from "../../types";

const props = defineProps<{
  demoId: DemoId | null;
  lang: Lang;
}>();

const emit = defineEmits<{
  close: [];
}>();

const currentStep = ref(0);
const copied = ref(false);
const copyFailed = ref(false);
let streamTimer: number | undefined;

const t = computed(() => copy[props.lang]);
const activeDemo = computed(() => demoItems[props.lang].find((demo) => demo.id === props.demoId) ?? null);
const dialogTitleId = computed(() => (activeDemo.value ? `demo-title-${activeDemo.value.id}` : undefined));
const isClaimCodeDemo = computed(() => props.demoId === "classicDesktop" || props.demoId === "classicMobile");

watch(
  () => props.demoId,
  () => {
    resetDemoState();
  },
);

onBeforeUnmount(() => {
  clearStreamTimer();
});

function clearStreamTimer() {
  window.clearInterval(streamTimer);
  streamTimer = undefined;
}

function resetDemoState() {
  currentStep.value = 0;
  copied.value = false;
  copyFailed.value = false;
  clearStreamTimer();
}

function advanceDemo() {
  if (!activeDemo.value) return;
  if (currentStep.value >= activeDemo.value.steps.length - 1) {
    currentStep.value = 0;
    return;
  }
  currentStep.value += 1;
}

function playStream() {
  if (!activeDemo.value) return;
  currentStep.value = 0;
  clearStreamTimer();
  streamTimer = window.setInterval(() => {
    if (!activeDemo.value || currentStep.value >= activeDemo.value.steps.length - 1) {
      clearStreamTimer();
      return;
    }
    currentStep.value += 1;
  }, 850);
}

async function copyClaimCode() {
  copyFailed.value = false;

  try {
    await navigator.clipboard.writeText(CLAIM_CODE);
    copied.value = true;
  } catch {
    copyFailed.value = true;
    copied.value = false;
  }
}
</script>

<template>
  <Dialog :open="demoId !== null" :labelled-by="dialogTitleId" @close="emit('close')">
    <div v-if="activeDemo" class="overflow-hidden">
      <div :class="['sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gradient-to-r p-5 text-white shadow-lg', activeDemo.accent]">
        <div class="flex items-center gap-3">
          <span class="text-3xl">{{ activeDemo.icon }}</span>
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Interactive Demo</p>
            <h2 :id="dialogTitleId" class="text-xl font-black">{{ activeDemo.title }}</h2>
          </div>
        </div>
        <Button variant="ghost" size="sm" class="text-white hover:bg-white/15" @click="emit('close')"><X :size="16" />{{ t.close }}</Button>
      </div>

      <div class="grid gap-6 p-5 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card class="bg-white/80 p-6 dark:bg-white/5">
          <div class="rounded-[2rem] bg-zinc-950 p-5 text-white">
            <div v-if="activeDemo.id === 'desktopQr' || activeDemo.id === 'classicDesktop'" class="rounded-3xl bg-white p-4"><RealQrCode :value="QR_LOGIN_PAYLOAD" class="mx-auto size-56" /></div>
            <div v-else-if="activeDemo.id === 'mobileConfirm' || activeDemo.id === 'classicMobile'" class="mx-auto max-w-sm rounded-[2rem] border border-white/10 bg-white/10 p-5">
              <div class="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/30" />
              <Smartphone class="mx-auto text-sky-300" :size="58" />
              <p class="mt-5 text-center text-xl font-black">Banana Workspace</p>
              <p class="mt-2 text-center text-sm text-zinc-300">Chrome on macOS · Singapore</p>
            </div>
            <div v-else-if="activeDemo.id === 'pow'" class="space-y-4">
              <div class="h-3 overflow-hidden rounded-full bg-white/10"><div class="qauth-progress h-full rounded-full bg-amber-400" /></div>
              <code class="block rounded-2xl bg-black/40 p-4 text-sm text-amber-100">nonce = scan(challenge, difficulty: 18)</code>
            </div>
            <div v-else-if="activeDemo.id === 'sseFlow'" class="space-y-3">
              <div v-for="(step, index) in activeDemo.steps" :key="step" :class="['rounded-2xl p-4 text-sm ring-1', index <= currentStep ? 'bg-emerald-400/15 text-emerald-100 ring-emerald-300/20' : 'bg-white/5 text-zinc-400 ring-white/10']">{{ index <= currentStep ? '✅' : '○' }} {{ step }}</div>
            </div>
            <div v-else class="grid place-items-center rounded-3xl bg-white/10 p-10 text-center">
              <Fingerprint class="text-emerald-300" :size="72" />
              <p class="mt-5 text-2xl font-black">Passkey</p>
              <p class="mt-2 text-zinc-300">platform authenticator</p>
            </div>
            <div class="mt-5 rounded-2xl bg-white/10 p-4">
              <p class="text-sm text-zinc-300">{{ t.verifySymbols }}</p>
              <div class="mt-2 flex gap-2 text-2xl"><span v-for="emoji in VERIFY_EMOJIS" :key="emoji">{{ emoji }}</span></div>
            </div>
          </div>
        </Card>

        <Card class="bg-white/80 p-6 dark:bg-white/5">
          <p class="text-zinc-600 dark:text-zinc-300">{{ activeDemo.desc }}</p>
          <div class="mt-6 space-y-3">
            <div v-for="(step, index) in activeDemo.steps" :key="step" :class="['flex items-center gap-3 rounded-2xl p-4 ring-1 transition', index <= currentStep ? 'bg-emerald-50 text-emerald-900 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-100 dark:ring-emerald-400/20' : 'bg-zinc-50 text-zinc-500 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10']">
              <span class="grid size-8 shrink-0 place-items-center rounded-full bg-current/10 font-black">{{ index + 1 }}</span>
              <span class="font-medium">{{ step }}</span>
            </div>
          </div>

          <div v-if="isClaimCodeDemo" class="mt-6 rounded-2xl bg-zinc-950 p-5 text-center text-white">
            <p class="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">{{ t.claimCode }}</p>
            <p class="mt-3 select-all font-mono text-3xl font-black tracking-widest">{{ CLAIM_CODE }}</p>
            <Button variant="outline" class="mt-4 w-full border-white/20 bg-white/10 text-white hover:bg-white/20" @click="copyClaimCode"><Copy :size="16" />{{ copied ? t.copied : t.copyCode }}</Button>
            <p v-if="copyFailed" class="mt-3 text-sm text-amber-200" role="status">{{ t.copyFailed }}</p>
            <p v-else-if="copied" class="mt-3 text-sm text-emerald-200" role="status">{{ t.copied }}</p>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <Button v-if="activeDemo.id === 'sseFlow'" class="rounded-2xl" @click="playStream">{{ t.replay }}</Button>
            <Button v-else class="rounded-2xl" @click="advanceDemo">{{ currentStep >= activeDemo.steps.length - 1 ? '↺' : '→' }} {{ t.openDemo }}</Button>
            <Button variant="outline" class="rounded-2xl" @click="resetDemoState">{{ t.reset }}</Button>
          </div>
        </Card>
      </div>
    </div>
  </Dialog>
</template>
