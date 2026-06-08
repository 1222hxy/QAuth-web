<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { ArrowRight, Check, Clipboard, Code2 } from "lucide-vue-next";
import Button from "../ui/Button.vue";

const emit = defineEmits<{ navigate: [to: string] }>();
const code = "const session = await qauth.signIn({ method: 'trusted-device' })\nawait qauth.verify(session)";
const flow = ["Create session", "Confirm on trusted device", "Verify session"];

const copied = ref(false);
let copyTimer: number | undefined;

const copyLabel = computed(() => (copied.value ? "Copied" : "Copy"));
const CopyIcon = computed(() => (copied.value ? Check : Clipboard));
const highlightedLight = `<pre class="shiki github-light-default" style="background-color:#ffffff;color:#1f2328" tabindex="0"><code><span class="line"><span style="color:#CF222E">const</span><span style="color:#0550AE"> session</span><span style="color:#CF222E"> =</span><span style="color:#CF222E"> await</span><span style="color:#1F2328"> qauth.</span><span style="color:#8250DF">signIn</span><span style="color:#1F2328">({ method: </span><span style="color:#0A3069">'trusted-device'</span><span style="color:#1F2328"> })</span></span>
<span class="line"><span style="color:#CF222E">await</span><span style="color:#1F2328"> qauth.</span><span style="color:#8250DF">verify</span><span style="color:#1F2328">(session)</span></span></code></pre>`;
const highlightedDark = `<pre class="shiki github-dark-default" style="background-color:#0d1117;color:#e6edf3" tabindex="0"><code><span class="line"><span style="color:#FF7B72">const</span><span style="color:#79C0FF"> session</span><span style="color:#FF7B72"> =</span><span style="color:#FF7B72"> await</span><span style="color:#E6EDF3"> qauth.</span><span style="color:#D2A8FF">signIn</span><span style="color:#E6EDF3">({ method: </span><span style="color:#A5D6FF">'trusted-device'</span><span style="color:#E6EDF3"> })</span></span>
<span class="line"><span style="color:#FF7B72">await</span><span style="color:#E6EDF3"> qauth.</span><span style="color:#D2A8FF">verify</span><span style="color:#E6EDF3">(session)</span></span></code></pre>`;

onBeforeUnmount(() => window.clearTimeout(copyTimer));

async function copyCode() {
  await navigator.clipboard.writeText(code);
  copied.value = true;
  window.clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => {
    copied.value = false;
  }, 1400);
}
</script>

<template>
  <section id="developers" class="qauth-section-enter mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
    <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Developer experience</p>
        <h2 class="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">一行代码接入可信设备认证</h2>
        <p class="mt-4 max-w-xl text-base leading-7 text-muted-foreground">使用 QAuth SDK 创建认证请求，并在服务端校验已确认的 session。首页只展示轻量接入路径，复杂策略可以在服务端逐步收纳。</p>
        <ol class="mt-7 space-y-3">
          <li v-for="(item, index) in flow" :key="item" class="group flex items-center gap-3 text-sm text-muted-foreground transition duration-200 hover:text-foreground">
            <span class="grid size-7 place-items-center rounded-full border border-border bg-card text-xs font-semibold text-foreground transition duration-200 group-hover:-translate-y-0.5 group-hover:border-foreground/20">{{ index + 1 }}</span>{{ item }}
          </li>
        </ol>
        <Button class="group mt-8 rounded-full" @click="emit('navigate', '/docs')">查看文档 <ArrowRight class="transition duration-200 group-hover:translate-x-0.5" :size="17" /></Button>
      </div>

      <div class="group overflow-hidden rounded-[1.6rem] border border-black/10 bg-white/70 shadow-[0_24px_70px_hsl(var(--foreground)/0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-[0_28px_80px_hsl(var(--foreground)/0.1)] dark:border-white/10 dark:bg-zinc-950/70 dark:hover:border-white/15 sm:rounded-[1.85rem]">
        <div class="flex min-h-11 items-center justify-between gap-3 border-b border-black/10 bg-white/55 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.035] sm:px-5">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex items-center gap-1.5" aria-hidden="true">
              <span class="size-2.5 rounded-full bg-[#ff5f57] shadow-sm" />
              <span class="size-2.5 rounded-full bg-[#ffbd2e] shadow-sm" />
              <span class="size-2.5 rounded-full bg-[#28c840] shadow-sm" />
            </span>
            <span class="hidden h-4 w-px bg-border sm:block" />
            <span class="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground/85"><Code2 class="shrink-0" :size="15" />auth.ts</span>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span class="hidden rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground dark:border-white/10 dark:bg-white/[0.04] sm:inline-flex">TypeScript</span>
            <button class="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 text-xs font-medium text-foreground/80 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-black/15 hover:bg-white active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-white/15 dark:hover:bg-white/[0.08]" type="button" @click="copyCode">
              <component :is="CopyIcon" :size="13" />
              <Transition name="qauth-copy-label" mode="out-in">
                <span :key="copyLabel">{{ copyLabel }}</span>
              </Transition>
            </button>
          </div>
        </div>

        <div class="qauth-code-shell relative overflow-x-auto bg-zinc-50/85 p-4 dark:bg-[#0d1117] sm:p-5">
          <div class="qauth-shiki qauth-shiki-light dark:hidden" v-html="highlightedLight" />
          <div class="qauth-shiki qauth-shiki-dark hidden dark:block" v-html="highlightedDark" />
        </div>
      </div>
    </div>
  </section>
</template>
