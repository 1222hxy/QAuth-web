<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import AppFooter from "./components/layout/AppFooter.vue";
import AppHeader from "./components/layout/AppHeader.vue";
import OfflineStatus from "./components/pwa/OfflineStatus.vue";
import PwaInstallPrompt from "./components/pwa/PwaInstallPrompt.vue";
import PwaUpdatePrompt from "./components/pwa/PwaUpdatePrompt.vue";
import DocsView from "./components/views/DocsView.vue";
import LandingView from "./components/views/LandingView.vue";
import DemoPage from "./components/views/DemoPage.vue";
import RoadmapView from "./components/views/RoadmapView.vue";
import SecurityView from "./components/views/SecurityView.vue";
import type { Lang, NavTarget, RoutePath } from "./types";

type ThemeMode = "light" | "dark" | "system";

const ROUTES: RoutePath[] = ["/", "/demo", "/docs", "/security", "/roadmap"];

const lang = ref<Lang>("zh");
const themeMode = ref<ThemeMode>("system");
const path = ref<RoutePath>("/");
let mediaQuery: MediaQueryList | null = null;

const navItems = computed<NavTarget[]>(() => [
  { label: "产品", to: "/", hash: "#product" },
  { label: "安全", to: "/", hash: "#security" },
  { label: "文档", to: "/docs" },
  { label: "Demo", to: "/demo" },
]);
const currentRoute = computed<RoutePath>(() => path.value);

onMounted(() => {
  lang.value = localStorage.getItem("qauth-lang") === "en" ? "en" : "zh";
  themeMode.value = readThemeMode();
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", applyTheme);
  syncPathFromLocation();
  applyTheme();
  document.documentElement.lang = lang.value === "zh" ? "zh-CN" : "en";
  window.addEventListener("popstate", syncPathFromLocation);
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", syncPathFromLocation);
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

function normalizePath(value: string): RoutePath {
  return ROUTES.includes(value as RoutePath) ? (value as RoutePath) : "/";
}

function syncPathFromLocation() {
  path.value = normalizePath(window.location.pathname);
  if (window.location.hash) scrollToHash(window.location.hash);
}

function applyTheme() {
  const shouldDark = themeMode.value === "dark" || (themeMode.value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", shouldDark);
  document.documentElement.style.colorScheme = shouldDark ? "dark" : "light";
}

function navigate(target: string | NavTarget) {
  const to = typeof target === "string" ? target : `${target.to}${target.hash ?? ""}`;
  const url = new URL(to, window.location.origin);
  const nextPath = normalizePath(url.pathname);
  history.pushState({}, "", `${nextPath}${url.hash}`);
  path.value = nextPath;

  if (url.hash) scrollToHash(url.hash);
  else scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToHash(hash: string) {
  nextTick(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

</script>

<template>
  <div class="qauth-page-bg min-h-screen text-foreground">
    <AppHeader :nav-items="navItems" :theme-mode="themeMode" @navigate="navigate" @update:theme-mode="themeMode = $event" />

    <main>
      <LandingView v-if="currentRoute === '/'" :lang="lang" @navigate="navigate" />
      <DemoPage v-else-if="currentRoute === '/demo'" :lang="lang" @navigate="navigate" />
      <DocsView v-else-if="currentRoute === '/docs'" :lang="lang" @navigate="navigate" />
      <SecurityView v-else-if="currentRoute === '/security'" :lang="lang" />
      <RoadmapView v-else-if="currentRoute === '/roadmap'" :lang="lang" />
    </main>

    <AppFooter />
    <PwaInstallPrompt />
    <PwaUpdatePrompt />
    <OfflineStatus />
  </div>
</template>
