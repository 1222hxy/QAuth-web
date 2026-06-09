<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type InstallPromptOutcome = "accepted" | "dismissed";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: InstallPromptOutcome; platform: string }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY = "qauth-pwa-install-dismissed";
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const dismissed = ref(false);
const isIosSafari = ref(false);

const canShowPrompt = computed(() => !dismissed.value && (deferredPrompt.value !== null || isIosSafari.value));
const promptText = computed(() => (deferredPrompt.value ? "安装 QAuth" : "添加到主屏幕"));
const helpText = computed(() => (deferredPrompt.value ? "作为独立应用打开，桌面端和移动端都可用。" : "在 Safari 中点击分享按钮，然后选择“添加到主屏幕”。"));

onMounted(() => {
  dismissed.value = localStorage.getItem(STORAGE_KEY) === "1" || isStandalone();
  isIosSafari.value = isIosSafariBrowser() && !isStandalone();
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
  window.addEventListener("appinstalled", handleInstalled);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
  window.removeEventListener("appinstalled", handleInstalled);
});

function handleBeforeInstallPrompt(event: BeforeInstallPromptEvent) {
  event.preventDefault();
  if (localStorage.getItem(STORAGE_KEY) === "1") return;
  deferredPrompt.value = event;
  dismissed.value = false;
}

function handleInstalled() {
  dismiss();
}

async function install() {
  if (!deferredPrompt.value) return;
  const prompt = deferredPrompt.value;
  deferredPrompt.value = null;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  if (choice.outcome === "dismissed") dismiss();
}

function dismiss() {
  dismissed.value = true;
  deferredPrompt.value = null;
  localStorage.setItem(STORAGE_KEY, "1");
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
}

function isIosSafariBrowser() {
  const ua = window.navigator.userAgent;
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua) || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isAppleMobile && isSafari;
}
</script>

<template>
  <Transition name="qauth-pwa-toast">
    <aside v-if="canShowPrompt" class="fixed bottom-4 left-4 z-40 w-[calc(100vw-2rem)] max-w-xs rounded-3xl border border-border bg-card/94 p-4 text-card-foreground shadow-xl shadow-black/10 backdrop-blur-xl dark:shadow-black/35 sm:bottom-6 sm:left-6" aria-label="PWA install prompt">
      <p class="text-sm font-semibold text-foreground">{{ promptText }}</p>
      <p class="mt-1 text-xs leading-5 text-muted-foreground">{{ helpText }}</p>
      <div class="mt-4 flex items-center justify-end gap-2">
        <button class="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground" type="button" @click="dismiss">稍后</button>
        <button v-if="deferredPrompt" class="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 active:scale-95" type="button" @click="install">安装</button>
      </div>
    </aside>
  </Transition>
</template>
