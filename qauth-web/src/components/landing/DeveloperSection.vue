<script setup lang="ts">
import { ArrowRight, Braces, Server } from "lucide-vue-next";
import Button from "../ui/Button.vue";

const emit = defineEmits<{ navigate: [to: string] }>();
const code = `const challenge = await qauth.login.createChallenge({\n  userId: user.id,\n  method: "passkey_or_qr",\n  bindToBrowser: true,\n});\n\nawait qauth.devices.confirm({\n  challengeId: challenge.id,\n  trustedDevice: request.device,\n  userVisible: true,\n});\n\nconst session = await qauth.login.verifySession({\n  challengeId: challenge.id,\n  browserBinding: challenge.binding,\n});`;

const flow = ["Create challenge", "Confirm on trusted device", "Verify session"];
</script>

<template>
  <section id="developers" class="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
    <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Developer experience</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">开发者接入</h2>
        <p class="mt-4 max-w-xl text-base leading-7 text-muted-foreground">接口围绕 challenge、trusted device 和 session verification 组织。你可以把 QAuth 接入现有登录页，也可以将它作为高风险操作的二次验证层。</p>
        <ol class="mt-7 space-y-3">
          <li v-for="(item, index) in flow" :key="item" class="flex items-center gap-3 text-sm text-muted-foreground">
            <span class="grid size-7 place-items-center rounded-full border border-border bg-card text-xs font-semibold text-foreground">{{ index + 1 }}</span>{{ item }}
          </li>
        </ol>
        <Button class="group mt-8 rounded-full" @click="emit('navigate', '/docs')">查看文档 <ArrowRight class="transition group-hover:translate-x-0.5" :size="17" /></Button>
      </div>
      <div class="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_24px_70px_hsl(var(--foreground)/0.08)]">
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <div class="flex items-center gap-2 text-sm font-medium text-foreground"><Braces :size="17" />qauth.ts</div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground"><Server :size="14" />SDK flow</div>
        </div>
        <pre class="overflow-x-auto p-5 text-[0.78rem] leading-6 text-foreground"><code>{{ code }}</code></pre>
      </div>
    </div>
  </section>
</template>
