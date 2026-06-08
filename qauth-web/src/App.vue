<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Languages, Moon, ShieldCheck, Sun } from "lucide-vue-next";
import Button from "./components/ui/Button.vue";
import DemoDialog from "./components/demos/DemoDialog.vue";
import DocsView from "./components/views/DocsView.vue";
import LandingView from "./components/views/LandingView.vue";
import RoadmapView from "./components/views/RoadmapView.vue";
import SecurityView from "./components/views/SecurityView.vue";
import { copy } from "./content";
import type { DemoId, Lang, NavTarget, RoutePath } from "./types";

const ROUTES: RoutePath[] = ["/", "/demo", "/docs", "/security", "/roadmap"];

const lang = ref<Lang>("zh");
const dark = ref(false);
const path = ref<RoutePath>("/");
const modalDemo = ref<DemoId | null>(null);

const t = computed(() => copy[lang.value]);
const navItems = computed<NavTarget[]>(() => [
  { label: t.value.nav.position, to: "/" },
  { label: t.value.nav.capabilities, to: "/demo", hash: "#capabilities" },
  { label: t.value.nav.flow, to: "/demo", hash: "#flow" },
  { label: t.value.nav.demos, to: "/demo", hash: "#demos" },
  { label: t.value.nav.security, to: "/security" },
  { label: t.value.nav.roadmap, to: "/roadmap" },
]);
const currentRoute = computed<RoutePath>(() => path.value);

onMounted(() => {
  lang.value = localStorage.getItem("qauth-lang") === "en" ? "en" : "zh";
  dark.value = localStorage.getItem("qauth-theme") === "dark" || (!localStorage.getItem("qauth-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  syncPathFromLocation();
  applyTheme();
  document.documentElement.lang = lang.value === "zh" ? "zh-CN" : "en";
  window.addEventListener("popstate", syncPathFromLocation);
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", syncPathFromLocation);
});

watch(lang, (value) => {
  localStorage.setItem("qauth-lang", value);
  document.documentElement.lang = value === "zh" ? "zh-CN" : "en";
});

watch(dark, applyTheme);

function normalizePath(value: string): RoutePath {
  return ROUTES.includes(value as RoutePath) ? (value as RoutePath) : "/";
}

function syncPathFromLocation() {
  path.value = normalizePath(window.location.pathname);
  if (window.location.hash) scrollToHash(window.location.hash);
}

function applyTheme() {
  document.documentElement.classList.toggle("dark", dark.value);
  localStorage.setItem("qauth-theme", dark.value ? "dark" : "light");
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

function openDemo(id: DemoId) {
  modalDemo.value = id;
}
</script>

<template>
  <main class="qauth-page-bg min-h-screen overflow-hidden text-zinc-950 dark:text-zinc-50">
    <header class="sticky top-0 z-40 border-b border-white/60 bg-white/75 shadow-sm shadow-slate-200/40 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/20">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <button class="group flex items-center gap-3" @click="navigate('/')">
          <span class="grid size-10 place-items-center rounded-2xl bg-zinc-950 text-white shadow-lg shadow-sky-500/20 dark:bg-white dark:text-zinc-950"><ShieldCheck :size="20" /></span>
          <span class="text-left">
            <span class="block text-lg font-black tracking-tight">QAuth</span>
            <span class="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">{{ t.badge }}</span>
          </span>
        </button>

        <nav class="hidden items-center gap-1 rounded-full border border-zinc-200/80 bg-white/70 p-1 shadow-sm dark:border-white/10 dark:bg-white/5 lg:flex">
          <button v-for="item in navItems" :key="item.label" class="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-950 hover:text-white dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-950" @click="navigate(item)">
            {{ item.label }}
          </button>
        </nav>

        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" class="rounded-full" @click="lang = lang === 'zh' ? 'en' : 'zh'"><Languages :size="15" />{{ lang.toUpperCase() }}</Button>
          <Button variant="outline" size="sm" class="rounded-full" @click="dark = !dark"><Sun v-if="dark" :size="16" /><Moon v-else :size="16" /></Button>
          <Button size="sm" class="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-4 shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-500" @click="navigate('/demo#demos')">{{ t.demo }}</Button>
        </div>
      </div>
    </header>

    <LandingView v-if="currentRoute === '/' || currentRoute === '/demo'" :lang="lang" @navigate="navigate" @open-demo="openDemo" />
    <DocsView v-else-if="currentRoute === '/docs'" :lang="lang" @navigate="navigate" />
    <SecurityView v-else-if="currentRoute === '/security'" :lang="lang" />
    <RoadmapView v-else-if="currentRoute === '/roadmap'" :lang="lang" />

    <DemoDialog :demo-id="modalDemo" :lang="lang" @close="modalDemo = null" />
  </main>
</template>
