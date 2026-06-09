<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const offline = ref(false);

onMounted(() => {
  updateNetworkState();
  window.addEventListener("online", updateNetworkState);
  window.addEventListener("offline", updateNetworkState);
});

onBeforeUnmount(() => {
  window.removeEventListener("online", updateNetworkState);
  window.removeEventListener("offline", updateNetworkState);
});

function updateNetworkState() {
  offline.value = !navigator.onLine;
}
</script>

<template>
  <Transition name="qauth-pwa-toast">
    <aside v-if="offline" class="fixed bottom-4 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 rounded-full border border-border bg-card/95 px-4 py-3 text-center text-sm font-medium text-foreground shadow-xl shadow-black/10 backdrop-blur-xl dark:shadow-black/35 sm:bottom-6" role="status" aria-live="polite">
      当前处于离线状态，部分在线功能可能不可用。
    </aside>
  </Transition>
</template>
