<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Menu, ShieldCheck, X } from "lucide-vue-next";
import Button from "../ui/Button.vue";
import ThemeToggle from "./ThemeToggle.vue";
import type { NavTarget } from "../../types";

const props = defineProps<{
  navItems: NavTarget[];
  themeMode: "light" | "dark" | "system";
}>();

const emit = defineEmits<{
  navigate: [target: string | NavTarget];
  "update:themeMode": [mode: "light" | "dark" | "system"];
}>();

const isScrolled = ref(false);
const menuOpen = ref(false);
const headerClasses = computed(() => [
  "sticky top-0 z-40 border-b backdrop-blur-2xl transition-[background-color,border-color,box-shadow] duration-300",
  isScrolled.value
    ? "border-border/90 bg-background/86 shadow-[0_1px_18px_hsl(var(--foreground)/0.06)]"
    : "border-border/50 bg-background/72",
]);

onMounted(() => {
  updateScrolled();
  window.addEventListener("scroll", updateScrolled, { passive: true });
});

onBeforeUnmount(() => window.removeEventListener("scroll", updateScrolled));
watch(menuOpen, (open) => document.documentElement.classList.toggle("overflow-hidden", open));

function updateScrolled() {
  isScrolled.value = window.scrollY > 8;
}

function go(target: string | NavTarget) {
  emit("navigate", target);
  menuOpen.value = false;
}
</script>

<template>
  <header :class="headerClasses">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <button class="group flex items-center gap-3 rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-ring" @click="go('/')">
        <span class="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-active:scale-95">
          <ShieldCheck :size="18" />
        </span>
        <span class="text-left">
          <span class="block text-[0.95rem] font-semibold tracking-[-0.01em] text-foreground">QAuth</span>
          <span class="hidden text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">Device-first auth</span>
        </span>
      </button>

      <nav class="hidden items-center rounded-full border border-border/70 bg-card/45 px-2 py-1 shadow-sm lg:flex" aria-label="Main navigation">
        <button v-for="item in navItems" :key="item.label" class="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition duration-200 hover:bg-secondary hover:text-foreground active:scale-[0.98]" @click="go(item)">
          {{ item.label }}
        </button>
      </nav>

      <div class="hidden items-center gap-2 md:flex">
        <ThemeToggle :mode="themeMode" @update:mode="emit('update:themeMode', $event)" />
        <Button size="sm" class="rounded-full px-4" @click="go('/demo#demos')">进入 Demo</Button>
      </div>

      <button class="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition hover:-translate-y-0.5 hover:bg-secondary active:scale-95 md:hidden" aria-label="Open menu" @click="menuOpen = !menuOpen">
        <X v-if="menuOpen" :size="18" />
        <Menu v-else :size="18" />
      </button>
    </div>

    <Transition name="qauth-mobile-menu">
      <div v-if="menuOpen" class="border-t border-border bg-background/96 px-4 pb-5 pt-3 shadow-xl backdrop-blur-2xl md:hidden">
        <nav class="mx-auto grid max-w-7xl gap-1" aria-label="Mobile navigation">
          <button v-for="item in navItems" :key="item.label" class="rounded-2xl px-4 py-3 text-left text-base font-medium text-foreground transition hover:bg-secondary active:scale-[0.99]" @click="go(item)">
            {{ item.label }}
          </button>
        </nav>
        <div class="mx-auto mt-4 flex max-w-7xl items-center gap-2">
          <ThemeToggle :mode="themeMode" @update:mode="emit('update:themeMode', $event)" />
          <Button class="flex-1 rounded-full" @click="go('/demo#demos')">进入 Demo</Button>
        </div>
      </div>
    </Transition>
  </header>
</template>
