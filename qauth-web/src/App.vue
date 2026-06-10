<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterView, useRouter } from "vue-router";
import AppFooter from "./components/layout/AppFooter.vue";
import AppHeader from "./components/layout/AppHeader.vue";
import OfflineStatus from "./components/pwa/OfflineStatus.vue";
import PwaInstallPrompt from "./components/pwa/PwaInstallPrompt.vue";
import PwaUpdatePrompt from "./components/pwa/PwaUpdatePrompt.vue";
import type { Lang, NavTarget } from "./types";

type ThemeMode = "light" | "dark" | "system";

const router = useRouter();
const lang = ref<Lang>("zh");
const themeMode = ref<ThemeMode>("system");
let mediaQuery: MediaQueryList | null = null;

const navItems = computed<NavTarget[]>(() => [
  { label: lang.value === "zh" ? "产品" : "Product", to: "/", hash: "#product" },
  { label: lang.value === "zh" ? "安全" : "Security", to: "/", hash: "#security" },
  { label: lang.value === "zh" ? "文档" : "Docs", to: "/docs" },
  { label: "Demo", to: "/demo" },
]);

onMounted(() => {
  lang.value = localStorage.getItem("qauth-lang") === "en" ? "en" : "zh";
  themeMode.value = readThemeMode();
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", applyTheme);
  applyTheme();
  document.documentElement.lang = lang.value === "zh" ? "zh-CN" : "en";
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener("change", applyTheme);
});

watch(lang, (value) => {
  localStorage.setItem("qauth-lang", value);
  document.documentElement.lang = value === "zh" ? "zh-CN" : "en";
});

watch(themeMode, (mode) => {
  localStorage.setItem("qauth-theme", mode);
  applyTheme();
});

function readThemeMode(): ThemeMode {
  const stored = localStorage.getItem("qauth-theme");
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function applyTheme() {
  const shouldDark = themeMode.value === "dark" || (themeMode.value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", shouldDark);
  document.documentElement.style.colorScheme = shouldDark ? "dark" : "light";
}

function navigate(target: string | NavTarget) {
  const to = typeof target === "string" ? target : `${target.to}${target.hash ?? ""}`;
  router.push(to);
}
</script>

<template>
  <div class="qauth-page-bg min-h-screen overflow-x-clip text-foreground">
    <AppHeader :nav-items="navItems" :theme-mode="themeMode" @navigate="navigate" @update:theme-mode="themeMode = $event" />

    <main class="app-main min-w-0">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :lang="lang" @navigate="navigate" />
      </RouterView>
    </main>

    <AppFooter />
    <PwaInstallPrompt />
    <PwaUpdatePrompt />
    <OfflineStatus />
  </div>
</template>
