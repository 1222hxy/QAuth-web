<script setup lang="ts">
import { ref } from "vue";
import { registerSW } from "virtual:pwa-register";

const needRefresh = ref(false);
const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    needRefresh.value = true;
  },
});

function closePrompt() {
  needRefresh.value = false;
}

function updateNow() {
  void updateServiceWorker(true);
}
</script>

<template>
  <Transition name="qauth-pwa-toast">
    <aside v-if="needRefresh" class="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl shadow-black/10 backdrop-blur-xl dark:shadow-black/35 sm:bottom-6 sm:right-6" role="status" aria-live="polite">
      <div class="flex items-start gap-3">
        <span class="mt-1 size-2.5 rounded-full bg-foreground/80" aria-hidden="true"></span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-foreground">新版本已准备好</p>
          <p class="mt-1 text-sm leading-5 text-muted-foreground">刷新后即可使用最新版本。</p>
          <div class="mt-4 flex justify-end gap-2">
            <button class="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground" type="button" @click="closePrompt">稍后</button>
            <button class="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-95" type="button" @click="updateNow">立即更新</button>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>
