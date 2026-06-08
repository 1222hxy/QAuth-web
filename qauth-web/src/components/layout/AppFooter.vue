<script setup lang="ts">
const year = new Date().getFullYear();
const groups = [
  { title: "Product", links: ["Passkey", "QR confirmation", "Trusted devices"] },
  { title: "Security", links: ["Device binding", "Replay protection", "Step-up verification"] },
  { title: "Docs", links: ["API", "SDK", "Demo"] },
];
</script>

<template>
  <footer class="border-t border-border bg-background/70">
    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
      <div>
        <p class="text-lg font-semibold tracking-tight text-foreground">QAuth</p>
        <p class="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Device-first authentication engine for passwordless login, QR approval and trusted device management.</p>
        <p class="mt-6 text-xs text-muted-foreground">© {{ year }} QAuth. All rights reserved.</p>
      </div>
      <div class="grid gap-8 sm:grid-cols-3">
        <div v-for="group in groups" :key="group.title">
          <h3 class="text-sm font-semibold text-foreground">{{ group.title }}</h3>
          <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
            <li v-for="link in group.links" :key="link">{{ link }}</li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>
