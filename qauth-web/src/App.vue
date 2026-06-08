<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ArrowRight, CheckCircle2, Copy, Fingerprint, KeyRound, Languages, LockKeyhole, Moon, Play, QrCode, ShieldCheck, Smartphone, Sparkles, Sun, X, Zap } from "lucide-vue-next";
import Button from "./components/ui/Button.vue";
import Card from "./components/ui/Card.vue";
import Badge from "./components/ui/Badge.vue";
import Dialog from "./components/ui/Dialog.vue";

type Lang = "zh" | "en";
type RoutePath = "/" | "/demo" | "/docs" | "/security" | "/roadmap";
type DemoId = "desktopQr" | "mobileConfirm" | "pow" | "register" | "passkeyLogin" | "classicDesktop" | "classicMobile" | "sseFlow";

type Demo = {
  id: DemoId;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  steps: string[];
};

const CLAIM = "K7Q9-M4VX-2PDA";
const EMOJIS = ["🦊", "🌙", "🚀", "🍒"];

const copy = {
  zh: {
    demo: "进入 Demo",
    badge: "Device-first Authentication Engine",
    heroA: "把登录体验改成",
    heroB: "可信设备确认",
    heroDesc: "QAuth 是一套无密码认证引擎：Passkey、扫码确认、设备绑定、二次验证都在一个漂亮清晰的体验里完成。",
    cta1: "立即进入 Demo",
    cta2: "查看安全设计",
    trusted: "可信设备",
    qr: "扫码批准",
    passkey: "Passkey 登录",
    live: "实时状态",
    nav: {
      position: "定位",
      capabilities: "能力",
      flow: "流程",
      demos: "Demo",
      security: "安全",
      roadmap: "路线图",
    },
    sections: {
      capabilities: "它能解决什么",
      capabilitiesDesc: "不是又一个普通登录页，而是把高风险认证流程产品化。",
      flow: "认证流程一眼看懂",
      flowDesc: "电脑、手机、服务器状态清楚分层，用户知道自己在批准什么。",
      demo: "可点击 Demo",
      demoDesc: "所有 Demo 卡片都能打开，不再是假按钮。",
      docs: "开发者文档",
      security: "安全设计",
      roadmap: "产品路线图",
    },
    docsDesc: "接入设计、接口边界、状态机和部署方式的入口。",
    close: "关闭",
    copied: "已复制",
    copyCode: "复制领取码",
    replay: "重放事件流",
    openDemo: "打开演示",
    backDemo: "返回 Demo",
  },
  en: {
    demo: "Open Demo",
    badge: "Device-first Authentication Engine",
    heroA: "Make sign-in feel like",
    heroB: "trusted device approval",
    heroDesc: "QAuth is a passwordless auth engine that brings passkeys, QR approval, device binding, and step-up verification into one polished flow.",
    cta1: "Open Demo Now",
    cta2: "View Security Design",
    trusted: "Trusted device",
    qr: "QR approval",
    passkey: "Passkey sign-in",
    live: "Live status",
    nav: {
      position: "Position",
      capabilities: "Capabilities",
      flow: "Flow",
      demos: "Demo",
      security: "Security",
      roadmap: "Roadmap",
    },
    sections: {
      capabilities: "What it fixes",
      capabilitiesDesc: "Not another generic login page — a productized high-risk authentication experience.",
      flow: "Auth flow at a glance",
      flowDesc: "Desktop, phone, and server states are separated clearly so users know what they approve.",
      demo: "Clickable demos",
      demoDesc: "Every demo card opens. No dead buttons.",
      docs: "Developer docs",
      security: "Security design",
      roadmap: "Product roadmap",
    },
    docsDesc: "Entry point for integration design, API boundaries, state machines, and deployment.",
    close: "Close",
    copied: "Copied",
    copyCode: "Copy claim code",
    replay: "Replay stream",
    openDemo: "Open demo",
    backDemo: "Back to Demo",
  },
};

const capabilities = {
  zh: [
    { icon: Fingerprint, title: "Passkey 优先", desc: "用设备解锁、面容或指纹完成登录，服务端只保存公钥。" },
    { icon: QrCode, title: "电脑扫码确认", desc: "二维码只包含会话编号，手机核对请求后把会话交回原浏览器。" },
    { icon: Zap, title: "抗滥用挑战", desc: "敏感入口前增加轻量计算挑战，提高机器人刷接口成本。" },
    { icon: KeyRound, title: "一次性领取码", desc: "老浏览器没有实时通道时，也能通过短时手动码完成登录。" },
  ],
  en: [
    { icon: Fingerprint, title: "Passkey-first", desc: "Sign in with device unlock, Face ID, or fingerprint. The server stores public keys only." },
    { icon: QrCode, title: "Desktop QR approval", desc: "The QR contains only a session id; phone approval returns the session to the original browser." },
    { icon: Zap, title: "Abuse challenge", desc: "A lightweight puzzle before sensitive entry points raises bot and brute-force costs." },
    { icon: KeyRound, title: "One-time claim code", desc: "Legacy browsers can still sign in with a short-lived manual fallback code." },
  ],
};

const flow = {
  zh: ["电脑创建扫码会话", "手机扫码并核对设备符号", "Passkey / 设备解锁批准", "服务端校验绑定关系", "原浏览器自动登录"],
  en: ["Desktop creates QR session", "Phone scans and checks symbols", "Passkey / device unlock approves", "Server validates device binding", "Original browser signs in"],
};

const demoItems: Record<Lang, Demo[]> = {
  zh: [
    { id: "desktopQr", icon: "💻", title: "电脑二维码登录", desc: "桌面展示二维码、设备符号和实时等待状态。", accent: "from-sky-500 to-cyan-400", steps: ["生成 login_session_id", "展示二维码", "等待手机扫码", "领取已批准会话"] },
    { id: "mobileConfirm", icon: "📱", title: "手机确认登录", desc: "手机核对地点、设备和屏幕符号后批准。", accent: "from-violet-500 to-fuchsia-500", steps: ["扫描二维码", "核对请求来源", "设备解锁", "批准本次登录"] },
    { id: "pow", icon: "🧮", title: "计算挑战", desc: "浏览器完成轻量工作量证明后继续登录。", accent: "from-amber-500 to-orange-500", steps: ["拉取挑战", "本地寻找 nonce", "提交证明", "继续认证"] },
    { id: "register", icon: "🔐", title: "Passkey 注册", desc: "模拟创建凭证、公钥和设备绑定记录。", accent: "from-emerald-500 to-teal-400", steps: ["创建注册挑战", "调用浏览器 Passkey", "保存公钥", "绑定可信设备"] },
    { id: "passkeyLogin", icon: "🛡️", title: "Passkey 登录", desc: "模拟使用设备私钥签名并完成服务端验证。", accent: "from-indigo-500 to-blue-500", steps: ["创建登录挑战", "设备完成签名", "服务端验证签名", "建立会话"] },
    { id: "classicDesktop", icon: "🗝️", title: "电脑领取码", desc: "没有实时通道时，电脑输入手机显示的一次性码。", accent: "from-rose-500 to-pink-500", steps: ["手机完成验证", "显示领取码", "电脑输入领取码", "领取码失效"] },
    { id: "classicMobile", icon: "📲", title: "手机领取码", desc: "手机端生成短时一次性登录码。", accent: "from-lime-500 to-emerald-400", steps: ["核对电脑符号", "设备验证", "生成 60 秒码", "提示电脑输入"] },
    { id: "sseFlow", icon: "📡", title: "SSE 状态流", desc: "演示连接、扫码、批准、领取会话的事件流。", accent: "from-slate-700 to-zinc-500", steps: ["连接已建立", "手机已扫码", "手机已确认", "电脑领取会话"] },
  ],
  en: [
    { id: "desktopQr", icon: "💻", title: "Desktop QR sign-in", desc: "Desktop shows QR, symbols, and live waiting state.", accent: "from-sky-500 to-cyan-400", steps: ["Create login_session_id", "Show QR code", "Wait for phone scan", "Claim approved session"] },
    { id: "mobileConfirm", icon: "📱", title: "Mobile approval", desc: "Phone checks location, device, and screen symbols before approval.", accent: "from-violet-500 to-fuchsia-500", steps: ["Scan QR", "Review request source", "Unlock device", "Approve this sign-in"] },
    { id: "pow", icon: "🧮", title: "Proof challenge", desc: "Browser solves a light proof-of-work before continuing.", accent: "from-amber-500 to-orange-500", steps: ["Fetch challenge", "Find nonce locally", "Submit proof", "Continue auth"] },
    { id: "register", icon: "🔐", title: "Passkey registration", desc: "Simulate credential creation, public key storage, and device binding.", accent: "from-emerald-500 to-teal-400", steps: ["Create challenge", "Call browser passkey", "Store public key", "Bind trusted device"] },
    { id: "passkeyLogin", icon: "🛡️", title: "Passkey sign-in", desc: "Simulate device signature and server verification.", accent: "from-indigo-500 to-blue-500", steps: ["Create login challenge", "Device signs", "Server verifies", "Create session"] },
    { id: "classicDesktop", icon: "🗝️", title: "Desktop claim code", desc: "Desktop enters a one-time code shown on phone when realtime is unavailable.", accent: "from-rose-500 to-pink-500", steps: ["Phone verifies", "Show claim code", "Desktop enters code", "Code expires"] },
    { id: "classicMobile", icon: "📲", title: "Mobile claim code", desc: "Phone generates a short-lived one-time sign-in code.", accent: "from-lime-500 to-emerald-400", steps: ["Check desktop symbols", "Verify device", "Generate 60s code", "Prompt desktop entry"] },
    { id: "sseFlow", icon: "📡", title: "SSE status stream", desc: "Show connect, scan, approve, and claim-session events.", accent: "from-slate-700 to-zinc-500", steps: ["Connection opened", "Phone scanned", "Phone approved", "Desktop claimed session"] },
  ],
};

const docsItems = {
  zh: ["API 设计", "WebAuthn 验证流程", "扫码会话状态机", "数据库设计", "部署方式", "OAuth / OIDC 兼容设计"],
  en: ["API design", "WebAuthn verification", "QR session state machine", "Database schema", "Deployment", "OAuth / OIDC compatibility"],
};

const protections = {
  zh: ["二维码不携带令牌或密钥", "电脑登录绑定原始浏览器", "领取码短时有效且一次性使用", "敏感操作需要重新验证", "计算挑战绑定具体操作", "服务端只保存必要的公钥与哈希"],
  en: ["QR carries no tokens or keys", "Desktop sign-in binds to the original browser", "Claim codes are short-lived and one-time", "Sensitive actions require fresh verification", "Challenges bind to concrete operations", "Server stores only necessary public keys and hashes"],
};

const roadmap = {
  zh: [
    { title: "当前可体验", items: ["静态产品页面", "8 个可点击 Demo", "主题与语言切换", "扫码 / Passkey 原型"] },
    { title: "正在实现", items: ["WebAuthn 服务端验证", "扫码状态机", "设备管理页面", "审计日志"] },
    { title: "未来计划", items: ["OAuth / OIDC 接入层", "风险策略控制台", "多产品租户", "生产部署模板"] },
  ],
  en: [
    { title: "Available now", items: ["Static product pages", "8 clickable demos", "Theme and language toggle", "QR / Passkey prototypes"] },
    { title: "In progress", items: ["WebAuthn server verification", "QR session state machine", "Device management", "Audit logs"] },
    { title: "Planned", items: ["OAuth / OIDC layer", "Risk policy console", "Multi-product tenants", "Production deployment templates"] },
  ],
};

const lang = ref<Lang>("zh");
const dark = ref(false);
const path = ref<RoutePath>("/");
const modalDemo = ref<DemoId | null>(null);
const currentStep = ref(0);
const copied = ref(false);
let demoTimer: number | undefined;

const t = computed(() => copy[lang.value]);
const activeDemo = computed(() => demoItems[lang.value].find((demo) => demo.id === modalDemo.value) ?? null);
const navItems = computed(() => [
  { label: t.value.nav.position, to: "/" },
  { label: t.value.nav.capabilities, to: "/demo#capabilities" },
  { label: t.value.nav.flow, to: "/demo#flow" },
  { label: t.value.nav.demos, to: "/demo#demos" },
  { label: t.value.nav.security, to: "/security" },
  { label: t.value.nav.roadmap, to: "/roadmap" },
]);
const currentRoute = computed<RoutePath>(() => (["/", "/demo", "/docs", "/security", "/roadmap"] as RoutePath[]).includes(path.value) ? path.value : "/");

onMounted(() => {
  lang.value = localStorage.getItem("qauth-lang") === "en" ? "en" : "zh";
  dark.value = localStorage.getItem("qauth-theme") === "dark" || (!localStorage.getItem("qauth-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  path.value = normalizePath(window.location.pathname);
  applyTheme();
  document.documentElement.lang = lang.value === "zh" ? "zh-CN" : "en";
  window.addEventListener("popstate", syncPathFromLocation);
  if (window.location.hash) scrollToHash(window.location.hash);
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", syncPathFromLocation);
  window.clearInterval(demoTimer);
});

watch(lang, (value) => {
  localStorage.setItem("qauth-lang", value);
  document.documentElement.lang = value === "zh" ? "zh-CN" : "en";
});

watch(dark, applyTheme);
watch(modalDemo, () => {
  currentStep.value = 0;
  copied.value = false;
  window.clearInterval(demoTimer);
});

function normalizePath(value: string): RoutePath {
  return (["/", "/demo", "/docs", "/security", "/roadmap"] as RoutePath[]).includes(value as RoutePath) ? (value as RoutePath) : "/";
}

function syncPathFromLocation() {
  path.value = normalizePath(window.location.pathname);
  if (window.location.hash) scrollToHash(window.location.hash);
}

function applyTheme() {
  document.documentElement.classList.toggle("dark", dark.value);
  localStorage.setItem("qauth-theme", dark.value ? "dark" : "light");
}

function navigate(to: string) {
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

function advanceDemo() {
  if (!activeDemo.value) return;
  if (currentStep.value >= activeDemo.value.steps.length - 1) {
    currentStep.value = 0;
    return;
  }
  currentStep.value += 1;
}

function playStream() {
  if (!activeDemo.value) return;
  currentStep.value = 0;
  window.clearInterval(demoTimer);
  demoTimer = window.setInterval(() => {
    if (!activeDemo.value || currentStep.value >= activeDemo.value.steps.length - 1) {
      window.clearInterval(demoTimer);
      return;
    }
    currentStep.value += 1;
  }, 850);
}

async function copyClaimCode() {
  await navigator.clipboard?.writeText(CLAIM);
  copied.value = true;
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
          <button v-for="item in navItems" :key="item.label" class="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-950 hover:text-white dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-950" @click="navigate(item.to)">
            {{ item.label }}
          </button>
        </nav>

        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" class="rounded-full" @click="lang = lang === 'zh' ? 'en' : 'zh'"><Languages :size="15" />{{ lang.toUpperCase() }}</Button>
          <Button variant="outline" size="sm" class="rounded-full" @click="dark = !dark"><Sun v-if="dark" :size="16" /><Moon v-else :size="16" /></Button>
          <Button size="sm" class="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-4 shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-500" @click="navigate('/demo')">{{ t.demo }}</Button>
        </div>
      </div>
    </header>

    <section v-if="currentRoute === '/'" id="position" class="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
      <div class="absolute left-8 top-14 hidden h-28 w-28 rounded-full bg-cyan-300/30 blur-3xl lg:block" />
      <div class="relative z-10">
        <Badge class="mb-6 border-sky-200 bg-sky-50 px-4 py-2 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200"><Sparkles :size="14" /> {{ t.badge }}</Badge>
        <h1 class="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-zinc-950 dark:text-white md:text-7xl">
          {{ t.heroA }}<br />
          <span class="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">{{ t.heroB }}</span>
        </h1>
        <p class="mt-7 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">{{ t.heroDesc }}</p>
        <div class="mt-9 flex flex-wrap gap-3">
          <Button size="lg" class="rounded-2xl bg-zinc-950 px-7 shadow-2xl shadow-sky-500/20 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950" @click="navigate('/demo')">{{ t.cta1 }} <ArrowRight :size="18" /></Button>
          <Button variant="outline" size="lg" class="rounded-2xl bg-white/70" @click="navigate('/security')">{{ t.cta2 }}</Button>
        </div>
        <div class="mt-10 grid max-w-2xl gap-3 sm:grid-cols-4">
          <div v-for="item in [t.trusted, t.qr, t.passkey, t.live]" :key="item" class="rounded-2xl border border-white/70 bg-white/65 p-4 text-sm font-semibold shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">{{ item }}</div>
        </div>
      </div>

      <Card class="qauth-hero-card relative overflow-hidden border-white/80 bg-white/80 p-4 shadow-2xl shadow-slate-300/40 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-black/30">
        <div class="rounded-[2rem] bg-zinc-950 p-5 text-white">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">QAuth Live Demo</p>
              <h2 class="mt-2 text-2xl font-bold">Banana Workspace</h2>
            </div>
            <div class="rounded-2xl bg-white/10 p-3"><QrCode /></div>
          </div>
          <div class="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div class="rounded-3xl bg-white p-4">
              <div class="qauth-qr mx-auto size-52 rounded-2xl" />
            </div>
            <div class="space-y-3">
              <div class="rounded-2xl bg-white/10 p-4">
                <p class="text-sm text-zinc-300">Verify symbols</p>
                <div class="mt-3 flex gap-2 text-2xl"><span v-for="emoji in EMOJIS" :key="emoji">{{ emoji }}</span></div>
              </div>
              <div class="rounded-2xl bg-emerald-400/15 p-4 text-sm text-emerald-100 ring-1 ring-emerald-300/20">✅ Phone scanned · waiting for approval</div>
              <button class="group flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 p-4 font-semibold" @click="navigate('/demo')">
                {{ t.cta1 }} <ArrowRight class="transition group-hover:translate-x-1" :size="18" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </section>

    <template v-else-if="currentRoute === '/demo'">
      <section class="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div class="rounded-[2rem] border border-white/70 bg-white/70 p-7 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/20 md:p-10">
          <Badge class="mb-4 bg-white/80 dark:bg-white/10"><Play :size="14" /> {{ t.sections.demo }}</Badge>
          <h1 class="text-4xl font-black tracking-tight md:text-6xl">{{ t.sections.demo }}</h1>
          <p class="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">{{ t.sections.demoDesc }}</p>
        </div>
      </section>

      <section id="capabilities" class="mx-auto max-w-7xl scroll-mt-28 px-5 py-8 lg:px-8">
        <div class="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Badge>{{ t.nav.capabilities }}</Badge>
            <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">{{ t.sections.capabilities }}</h2>
            <p class="mt-2 text-zinc-600 dark:text-zinc-300">{{ t.sections.capabilitiesDesc }}</p>
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card v-for="item in capabilities[lang]" :key="item.title" class="qauth-card-hover border-white/80 bg-white/75 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <component :is="item.icon" class="text-sky-500" :size="30" />
            <h3 class="mt-5 text-xl font-bold">{{ item.title }}</h3>
            <p class="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ item.desc }}</p>
          </Card>
        </div>
      </section>

      <section id="flow" class="mx-auto max-w-7xl scroll-mt-28 px-5 py-8 lg:px-8">
        <Card class="overflow-hidden border-white/80 bg-zinc-950 text-white shadow-2xl shadow-slate-400/20 dark:border-white/10">
          <div class="grid gap-8 p-7 md:grid-cols-[0.8fr_1.2fr] md:p-10">
            <div>
              <Badge class="border-white/15 bg-white/10 text-white">{{ t.nav.flow }}</Badge>
              <h2 class="mt-4 text-3xl font-black tracking-tight">{{ t.sections.flow }}</h2>
              <p class="mt-3 text-zinc-300">{{ t.sections.flowDesc }}</p>
            </div>
            <div class="space-y-3">
              <div v-for="(step, index) in flow[lang]" :key="step" class="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <span class="grid size-9 shrink-0 place-items-center rounded-full bg-sky-400 font-black text-zinc-950">{{ index + 1 }}</span>
                <span class="font-medium">{{ step }}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section id="demos" class="mx-auto max-w-7xl scroll-mt-28 px-5 py-10 lg:px-8">
        <div class="mb-7">
          <Badge>{{ t.nav.demos }}</Badge>
          <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">{{ t.sections.demo }}</h2>
        </div>
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <button v-for="demo in demoItems[lang]" :key="demo.id" class="group text-left" @click="openDemo(demo.id)">
            <Card class="qauth-card-hover h-full overflow-hidden border-white/80 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div :class="['h-2 bg-gradient-to-r', demo.accent]" />
              <div class="p-6">
                <div class="mb-5 flex items-center justify-between">
                  <span class="text-4xl">{{ demo.icon }}</span>
                  <span class="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500 transition group-hover:bg-zinc-950 group-hover:text-white dark:bg-white/10 dark:text-zinc-300">{{ t.openDemo }}</span>
                </div>
                <h3 class="text-xl font-black">{{ demo.title }}</h3>
                <p class="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ demo.desc }}</p>
              </div>
            </Card>
          </button>
        </div>
      </section>
    </template>

    <section v-else-if="currentRoute === '/docs'" class="mx-auto max-w-5xl px-5 py-16 lg:px-8">
      <Badge>{{ t.sections.docs }}</Badge>
      <h1 class="mt-4 text-5xl font-black tracking-tight">QAuth Docs</h1>
      <p class="mt-4 text-lg text-zinc-600 dark:text-zinc-300">{{ t.docsDesc }}</p>
      <div class="mt-8 grid gap-4 md:grid-cols-2">
        <Card v-for="item in docsItems[lang]" :key="item" class="qauth-card-hover bg-white/75 p-6 dark:bg-white/5"><CheckCircle2 class="mb-4 text-emerald-500" />{{ item }}</Card>
      </div>
      <Button class="mt-8 rounded-2xl" @click="navigate('/demo')">{{ t.backDemo }}</Button>
    </section>

    <section v-else-if="currentRoute === '/security'" class="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <Badge><LockKeyhole :size="14" /> {{ t.sections.security }}</Badge>
      <h1 class="mt-4 text-5xl font-black tracking-tight">{{ t.sections.security }}</h1>
      <div class="mt-8 grid gap-4 md:grid-cols-2">
        <Card v-for="item in protections[lang]" :key="item" class="qauth-card-hover border-white/80 bg-white/75 p-6 dark:border-white/10 dark:bg-white/5">
          <ShieldCheck class="mb-4 text-sky-500" />
          <p class="font-semibold">{{ item }}</p>
        </Card>
      </div>
    </section>

    <section v-else-if="currentRoute === '/roadmap'" class="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <Badge>{{ t.sections.roadmap }}</Badge>
      <h1 class="mt-4 text-5xl font-black tracking-tight">{{ t.sections.roadmap }}</h1>
      <div class="mt-8 grid gap-5 md:grid-cols-3">
        <Card v-for="column in roadmap[lang]" :key="column.title" class="border-white/80 bg-white/75 p-6 dark:border-white/10 dark:bg-white/5">
          <h2 class="text-2xl font-black">{{ column.title }}</h2>
          <ul class="mt-5 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
            <li v-for="item in column.items" :key="item" class="flex gap-2"><CheckCircle2 class="mt-0.5 shrink-0 text-emerald-500" :size="17" />{{ item }}</li>
          </ul>
        </Card>
      </div>
    </section>

    <Dialog :open="modalDemo !== null" @close="modalDemo = null">
      <div v-if="activeDemo" class="overflow-hidden">
        <div :class="['sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gradient-to-r p-5 text-white shadow-lg', activeDemo.accent]">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ activeDemo.icon }}</span>
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Interactive Demo</p>
              <h2 class="text-xl font-black">{{ activeDemo.title }}</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" class="text-white hover:bg-white/15" @click="modalDemo = null"><X :size="16" />{{ t.close }}</Button>
        </div>

        <div class="grid gap-6 p-5 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Card class="bg-white/80 p-6 dark:bg-white/5">
            <div class="rounded-[2rem] bg-zinc-950 p-5 text-white">
              <div v-if="activeDemo.id === 'desktopQr' || activeDemo.id === 'classicDesktop'" class="rounded-3xl bg-white p-4"><div class="qauth-qr mx-auto size-56 rounded-2xl" /></div>
              <div v-else-if="activeDemo.id === 'mobileConfirm' || activeDemo.id === 'classicMobile'" class="mx-auto max-w-sm rounded-[2rem] border border-white/10 bg-white/10 p-5">
                <div class="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/30" />
                <Smartphone class="mx-auto text-sky-300" :size="58" />
                <p class="mt-5 text-center text-xl font-black">Banana Workspace</p>
                <p class="mt-2 text-center text-sm text-zinc-300">Chrome on macOS · Singapore</p>
              </div>
              <div v-else-if="activeDemo.id === 'pow'" class="space-y-4">
                <div class="h-3 overflow-hidden rounded-full bg-white/10"><div class="qauth-progress h-full rounded-full bg-amber-400" /></div>
                <code class="block rounded-2xl bg-black/40 p-4 text-sm text-amber-100">nonce = scan(challenge, difficulty: 18)</code>
              </div>
              <div v-else-if="activeDemo.id === 'sseFlow'" class="space-y-3">
                <div v-for="(step, index) in activeDemo.steps" :key="step" :class="['rounded-2xl p-4 text-sm ring-1', index <= currentStep ? 'bg-emerald-400/15 text-emerald-100 ring-emerald-300/20' : 'bg-white/5 text-zinc-400 ring-white/10']">{{ index <= currentStep ? '✅' : '○' }} {{ step }}</div>
              </div>
              <div v-else class="grid place-items-center rounded-3xl bg-white/10 p-10 text-center">
                <Fingerprint class="text-emerald-300" :size="72" />
                <p class="mt-5 text-2xl font-black">Passkey</p>
                <p class="mt-2 text-zinc-300">platform authenticator</p>
              </div>
              <div class="mt-5 rounded-2xl bg-white/10 p-4">
                <p class="text-sm text-zinc-300">Verify symbols</p>
                <div class="mt-2 flex gap-2 text-2xl"><span v-for="emoji in EMOJIS" :key="emoji">{{ emoji }}</span></div>
              </div>
            </div>
          </Card>

          <Card class="bg-white/80 p-6 dark:bg-white/5">
            <p class="text-zinc-600 dark:text-zinc-300">{{ activeDemo.desc }}</p>
            <div class="mt-6 space-y-3">
              <div v-for="(step, index) in activeDemo.steps" :key="step" :class="['flex items-center gap-3 rounded-2xl p-4 ring-1 transition', index <= currentStep ? 'bg-emerald-50 text-emerald-900 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-100 dark:ring-emerald-400/20' : 'bg-zinc-50 text-zinc-500 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10']">
                <span class="grid size-8 shrink-0 place-items-center rounded-full bg-current/10 font-black">{{ index + 1 }}</span>
                <span class="font-medium">{{ step }}</span>
              </div>
            </div>

            <div v-if="activeDemo.id === 'classicDesktop' || activeDemo.id === 'classicMobile'" class="mt-6 rounded-2xl bg-zinc-950 p-5 text-center text-white">
              <p class="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">Claim code</p>
              <p class="mt-3 select-all font-mono text-3xl font-black tracking-widest">{{ CLAIM }}</p>
              <Button variant="outline" class="mt-4 w-full border-white/20 bg-white/10 text-white hover:bg-white/20" @click="copyClaimCode"><Copy :size="16" />{{ copied ? t.copied : t.copyCode }}</Button>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <Button v-if="activeDemo.id === 'sseFlow'" class="rounded-2xl" @click="playStream">{{ t.replay }}</Button>
              <Button v-else class="rounded-2xl" @click="advanceDemo">{{ currentStep >= activeDemo.steps.length - 1 ? '↺' : '→' }} {{ t.openDemo }}</Button>
              <Button variant="outline" class="rounded-2xl" @click="currentStep = 0">Reset</Button>
            </div>
          </Card>
        </div>
      </div>
    </Dialog>
  </main>
</template>
