<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { GitBranch, Moon, ShieldCheck, Sparkles, Sun, X } from "lucide-vue-next";
import Button from "./components/ui/Button.vue";
import Card from "./components/ui/Card.vue";
import Badge from "./components/ui/Badge.vue";
import Dialog from "./components/ui/Dialog.vue";

type Lang = "zh" | "en";
type DemoId = "desktopQr" | "mobileConfirm" | "pow" | "register" | "passkeyLogin" | "classicDesktop" | "classicMobile" | "sseFlow";

const EMOJIS = ["🦊", "🌙", "🚀", "🍒"];
const CLAIM = "K7Q9-M4VX-2PDA";

const i18n = {
  zh: {
    demo: "体验 Demo",
    openDemo: "打开演示",
    badge: "Device-first Authentication Engine",
    subtitle: "产品背后的无密码认证引擎",
    desc: "让你的产品支持 Passkey、扫码确认、设备绑定和高风险二次验证。用户看到的是你的品牌，认证系统由 QAuth 负责。",
    cta1: "体验登录演示",
    cta2: "查看接入设计",
    capabilities: "核心能力",
    flow: "典型流程",
    flowText: "电脑创建会话 → 手机扫码确认 → Passkey 批准 → 服务端验证绑定关系 → 原浏览器自动登录。",
    demoDocs: "Demo 与文档",
    demoText: "演示功能集中在 /demo，开发文档集中在 /docs；首页仅保留入口与价值说明。",
    toDemo: "前往 Demo",
    toDocs: "查看 Docs",
    toSecurity: "安全设计",
    toRoadmap: "产品路线图",
    roadmap: "路线图",
    now: "当前可体验",
    building: "正在实现",
    next: "未来计划",
    docsTitle: "QAuth Docs",
    docsDesc: "开发者文档入口，涵盖接入设计与认证流程。",
    backDemo: "查看完整交互演示",
    securityTitle: "安全设计",
    heroA: "让登录回到",
    heroB: "可信设备本身",
    heroDesc: "QAuth 是一个可复用的身份验证引擎，专为无密码、设备驱动的登录体验设计。它运行在你的产品背后，让用户看到产品品牌，同时由 QAuth 负责安全认证。",
    enterDemo: "进入可点击演示 →",
    explore: "查看方案能力",
    nav: ["定位", "能力", "流程", "演示", "安全", "路线图"],
    codeTitle: "像 GitHub 一样清晰的认证流程",
    codeDesc: "将关键步骤放进代码视图，便于开发、产品与安全团队统一理解。",
    close: "关闭",
    docsItems: ["API 设计", "WebAuthn 验证流程", "扫码会话状态机", "数据库设计", "部署方式", "OAuth / OIDC 兼容设计"],
    securitySteps: ["二维码只包含 login_session_id", "浏览器保存绑定令牌", "手机批准登录会话", "服务端同时校验批准状态和绑定令牌", "仅向原浏览器发放会话"],
    capabilitiesItems: ["Passkey 优先认证", "扫码确认登录", "高风险二次验证"],
  },
  en: {
    demo: "Open Demo",
    openDemo: "Open Demo",
    badge: "Device-first Authentication Engine",
    subtitle: "Passwordless authentication engine behind your product",
    desc: "Enable passkeys, QR approval, device binding, and high-risk step-up verification while keeping your own product brand front and center.",
    cta1: "Try Login Demo",
    cta2: "View Integration Design",
    capabilities: "Core Capabilities",
    flow: "Typical Flow",
    flowText: "Desktop creates session → phone scans and approves → passkey verifies → server checks binding → original browser receives session.",
    demoDocs: "Demo & Docs",
    demoText: "Interactive prototypes live in /demo and developer materials live in /docs.",
    toDemo: "Go to Demo",
    toDocs: "View Docs",
    toSecurity: "Security Design",
    toRoadmap: "Product Roadmap",
    roadmap: "Roadmap",
    now: "Available Now",
    building: "In Progress",
    next: "Planned",
    docsTitle: "QAuth Docs",
    docsDesc: "Developer entry for integration design and authentication flows.",
    backDemo: "Open full interactive demo",
    securityTitle: "Security Design",
    heroA: "Bring sign-in back to",
    heroB: "trusted devices",
    heroDesc: "QAuth is a reusable identity engine for passwordless, device-first sign-in. It runs behind your product brand while handling secure authentication.",
    enterDemo: "Open Interactive Demo →",
    explore: "Explore Capabilities",
    nav: ["Position", "Capabilities", "Flow", "Demos", "Security", "Roadmap"],
    codeTitle: "GitHub-style readable auth flow",
    codeDesc: "Show critical steps in a code view so engineering, product, and security teams stay aligned.",
    close: "Close",
    docsItems: ["API design", "WebAuthn verification", "QR session state machine", "Database schema", "Deployment", "OAuth / OIDC compatibility"],
    securitySteps: ["QR includes only login_session_id", "Browser stores binding token", "Phone approves session", "Server validates approval and token", "Session issued only to original browser"],
    capabilitiesItems: ["Passkey-first authentication", "QR approval sign-in", "High-risk step-up verification"],
  },
};

const featureCopy = {
  zh: [
    { icon: "🔐", title: "通行密钥优先", desc: "使用设备解锁、面容识别或指纹完成登录。服务器只保存公钥，不保存私钥或生物识别数据。" },
    { icon: "📱", title: "桌面扫码登录", desc: "电脑显示二维码，手机扫码确认，再把登录状态安全交回原电脑浏览器。" },
    { icon: "🧮", title: "计算挑战验证码", desc: "登录前让浏览器完成一次轻量计算任务，提高自动化刷接口和爆破备用入口的成本。" },
    { icon: "🗝️", title: "一次性领取码", desc: "旧浏览器无法使用实时通道时，可通过手机生成短时、一次性的手动登录码。" },
  ],
  en: [
    { icon: "🔐", title: "Passkey-first", desc: "Users sign in with device unlock, Face ID, or fingerprint. The server stores only public keys." },
    { icon: "📱", title: "Desktop QR sign-in", desc: "Desktop shows a QR code, phone confirms, and session is securely returned to the same browser." },
    { icon: "🧮", title: "Proof-of-work challenge", desc: "A lightweight browser puzzle raises abuse cost before sensitive login entry points." },
    { icon: "🗝️", title: "One-time claim code", desc: "When realtime channels are unavailable, users can manually type a short-lived fallback code." },
  ],
};

const flowCopy = {
  zh: [
    { label: "手机登录", title: "手机直接使用通行密钥", steps: ["打开产品登录页", "点击使用通行密钥", "面容识别或设备解锁", "服务器验证后建立会话"] },
    { label: "电脑登录", title: "电脑扫码，手机确认", steps: ["电脑创建扫码会话", "二维码只包含会话编号", "手机扫码并核对请求", "手机通过通行密钥确认", "电脑领取会话并登录"] },
    { label: "抗滥用", title: "登录前完成计算挑战", steps: ["服务器生成短时挑战", "浏览器本地寻找答案", "服务器低成本验证", "通过后继续创建登录会话"] },
    { label: "旧浏览器", title: "手动输入一次性领取码", steps: ["电脑显示二维码", "手机扫码并完成验证", "手机显示一次性领取码", "电脑输入领取码", "领取码失效并完成登录"] },
  ],
  en: [
    { label: "Mobile sign-in", title: "Use passkeys directly on phone", steps: ["Open product sign-in", "Tap use passkey", "Face ID or device unlock", "Server verifies and creates session"] },
    { label: "Desktop sign-in", title: "Desktop QR, phone approval", steps: ["Desktop creates QR session", "QR contains only session id", "Phone scans and checks request", "Phone confirms with passkey", "Desktop claims session and signs in"] },
    { label: "Abuse control", title: "Complete proof-of-work before sign-in", steps: ["Server creates short-lived challenge", "Browser searches locally", "Server verifies cheaply", "Continue creating login session"] },
    { label: "Legacy browser", title: "Manual one-time claim code", steps: ["Desktop shows QR", "Phone scans and verifies", "Phone shows one-time claim code", "Desktop enters claim code", "Code expires and sign-in completes"] },
  ],
};

const protections = {
  zh: ["默认不使用密码，降低密码泄露与撞库风险", "二维码中不放令牌、密钥或会话凭证", "电脑登录绑定原始浏览器，防止只拿到会话编号就登录", "领取码短时有效、一次性使用、服务端只保存哈希", "计算挑战绑定具体操作，不能跨接口复用", "敏感操作必须重新验证，防止登录后被直接改安全设置"],
  en: ["Passwordless by default to reduce password leakage and credential stuffing", "QR codes never carry tokens, keys, or session credentials", "Desktop sign-in binds to the original browser", "Claim codes are short-lived, one-time, and stored only as hashes", "Proof-of-work challenges bind to a concrete operation", "Sensitive operations require fresh verification"],
};

const limits = {
  zh: ["不能完全阻止实时中继式诱导攻击", "不能保护已被攻陷的手机或服务器", "不能阻止用户主动把一次性领取码发给攻击者", "不能替代通行密钥，只能作为抗滥用保护层"],
  en: ["Cannot fully stop realtime relay social-engineering attacks", "Cannot protect a compromised phone or server", "Cannot stop users from voluntarily sharing a one-time code", "Does not replace passkeys; it is an abuse-resistance layer"],
};

const architecture = {
  zh: [
    { icon: "🖥️", title: "网页界面", items: ["通行密钥注册", "扫码登录", "手机确认", "计算挑战", "设备管理"] },
    { icon: "🧩", title: "接口服务", items: ["注册挑战", "登录验证", "扫码会话", "领取码校验", "计算挑战校验"] },
    { icon: "🔒", title: "认证核心", items: ["挑战生成", "响应验证", "设备绑定", "风险检查", "工作量证明"] },
    { icon: "🗄️", title: "数据存储", items: ["用户", "通行密钥", "会话", "设备", "扫码会话", "计算挑战"] },
  ],
  en: [
    { icon: "🖥️", title: "Web UI", items: ["Passkey registration", "QR sign-in", "Mobile approval", "Proof-of-work", "Device management"] },
    { icon: "🧩", title: "API services", items: ["Registration challenge", "Login verification", "QR session", "Claim-code check", "PoW check"] },
    { icon: "🔒", title: "Auth core", items: ["Challenge creation", "Response verification", "Device binding", "Risk checks", "Proof-of-work"] },
    { icon: "🗄️", title: "Data storage", items: ["Users", "Passkeys", "Sessions", "Devices", "QR sessions", "PoW challenges"] },
  ],
};

const roadmapData = {
  zh: {
    now: ["静态产品页面", "扫码登录交互原型", "Passkey 浏览器调用演示", "计算挑战前端演示", "SSE 状态流演示"],
    building: ["WebAuthn 服务端验证", "扫码会话状态机", "数据库持久化", "设备管理页面"],
    next: ["OAuth / OIDC 接入层", "风险验证策略", "多产品接入控制台", "审计日志"],
  },
  en: {
    now: ["Static product pages", "QR sign-in interactive prototype", "Passkey browser API demo", "Proof-of-work frontend demo", "SSE status stream demo"],
    building: ["WebAuthn server verification", "QR session state machine", "Database persistence", "Device management page"],
    next: ["OAuth / OIDC integration layer", "Risk verification policies", "Multi-product console", "Audit logs"],
  },
};

const demoItems = {
  zh: [
    { id: "desktopQr", icon: "💻", title: "电脑二维码登录页", desc: "电脑显示二维码、请求符号、IP、地点、浏览器信息。" },
    { id: "mobileConfirm", icon: "📱", title: "手机扫码确认页", desc: "手机扫码后核对请求符号，再确认登录电脑。" },
    { id: "pow", icon: "🧮", title: "计算挑战验证码", desc: "纯前端寻找哈希答案，演示工作量证明式验证码。" },
    { id: "register", icon: "🔑", title: "注册通行密钥", desc: "调用浏览器的通行密钥注册能力，尝试创建凭据。" },
    { id: "passkeyLogin", icon: "👤", title: "通行密钥登录", desc: "调用浏览器的通行密钥登录能力，显示返回数据。" },
    { id: "classicDesktop", icon: "🔐", title: "电脑端领取码登录", desc: "老浏览器无实时通道时，手动输入手机返回的登录码。" },
    { id: "classicMobile", icon: "🛡️", title: "手机端返回领取码", desc: "手机验证后显示一次性登录码，用于旧浏览器备用登录。" },
    { id: "sseFlow", icon: "📡", title: "SSE 通信演示", desc: "自动播放服务端事件流状态，展示连接、推送、完成与重连。" },
  ],
  en: [
    { id: "desktopQr", icon: "💻", title: "Desktop QR Sign-in", desc: "Desktop view with QR, request symbols, IP, location, and browser info." },
    { id: "mobileConfirm", icon: "📱", title: "Mobile Approval", desc: "Phone checks request symbols and approves sign-in for desktop." },
    { id: "pow", icon: "🧮", title: "Proof-of-work", desc: "Client-side hash puzzle demo to simulate abuse-resistant entry checks." },
    { id: "register", icon: "🔑", title: "Passkey Registration", desc: "Calls browser passkey registration APIs and prints returned data." },
    { id: "passkeyLogin", icon: "👤", title: "Passkey Login", desc: "Calls browser passkey assertion APIs and prints returned data." },
    { id: "classicDesktop", icon: "🔐", title: "Desktop Claim Code", desc: "Manual fallback flow for legacy browsers without realtime channels." },
    { id: "classicMobile", icon: "🛡️", title: "Mobile Claim Code", desc: "Phone generates a one-time code after verification." },
    { id: "sseFlow", icon: "📡", title: "SSE Stream Demo", desc: "Auto-play server event stream states with replay controls." },
  ],
} as Record<Lang, Array<{ id: DemoId; icon: string; title: string; desc: string }>>;

const lang = ref<Lang>("zh");
const dark = ref(false);
const path = ref("/");
const modalDemo = ref<DemoId | null>(null);
const t = computed(() => i18n[lang.value]);

onMounted(() => {
  lang.value = localStorage.getItem("qauth-lang") === "en" ? "en" : "zh";
  dark.value = localStorage.getItem("qauth-theme") === "dark" || (!localStorage.getItem("qauth-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  path.value = window.location.pathname;
  applyTheme();
  window.addEventListener("popstate", () => (path.value = window.location.pathname));
});

watch(lang, (value) => {
  localStorage.setItem("qauth-lang", value);
  document.documentElement.lang = value === "zh" ? "zh-CN" : "en";
});

watch(dark, () => applyTheme());

function applyTheme() {
  document.documentElement.classList.toggle("dark", dark.value);
  localStorage.setItem("qauth-theme", dark.value ? "dark" : "light");
}

function navigate(to: string) {
  history.pushState({}, "", to);
  path.value = to;
  scrollTo({ top: 0, behavior: "smooth" });
}

function randomId(prefix = "sid_demo") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function randomIpv4Masked() {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.xxx`;
}
function randomBytes(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}
function bytesToBase64URL(bytes: ArrayBuffer) {
  return btoa(Array.from(new Uint8Array(bytes), (b) => String.fromCharCode(b)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
function openDemo(id: DemoId) {
  modalDemo.value = id;
}
function homePath() {
  return path.value === "/" || path.value === "/index.html";
}
</script>

<template>
  <main class="qauth-page-bg min-h-screen text-zinc-950 dark:text-zinc-50">
    <header class="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/75">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button class="text-lg font-bold tracking-tight" @click="navigate('/')">QAuth</button>
        <nav class="hidden items-center gap-2 md:flex">
          <button v-for="item in t.nav" :key="item" class="rounded-full px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900" @click="path === '/demo' ? null : navigate('/demo')">{{ item }}</button>
        </nav>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="lang = lang === 'zh' ? 'en' : 'zh'">{{ lang.toUpperCase() }}</Button>
          <Button variant="outline" size="sm" @click="dark = !dark"><Sun v-if="dark" :size="16" /><Moon v-else :size="16" /></Button>
          <Button size="sm" @click="navigate('/demo')">{{ t.demo }}</Button>
        </div>
      </div>
    </header>

    <HomeView v-if="homePath()" :lang="lang" :copy="t" @nav="navigate" />
    <DemoView v-else-if="path === '/demo'" :lang="lang" :copy="t" @open-demo="openDemo" />
    <DocsView v-else-if="path === '/docs'" :copy="t" @nav="navigate" />
    <SecurityView v-else-if="path === '/security'" :copy="t" />
    <RoadmapView v-else-if="path === '/roadmap'" :lang="lang" :copy="t" />
    <HomeView v-else :lang="lang" :copy="t" @nav="navigate" />

    <Dialog :open="modalDemo !== null" @close="modalDemo = null">
      <div class="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/90 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div class="font-semibold">{{ modalDemo ? demoItems[lang].find((d) => d.id === modalDemo)?.title : '' }}</div>
        <Button variant="ghost" size="sm" @click="modalDemo = null"><X :size="16" />{{ t.close }}</Button>
      </div>
      <div class="p-5 md:p-8">
        <DesktopQrDemo v-if="modalDemo === 'desktopQr'" :lang="lang" />
        <MobileConfirmDemo v-if="modalDemo === 'mobileConfirm'" :lang="lang" />
        <ProofChallengeDemo v-if="modalDemo === 'pow'" :lang="lang" />
        <WebAuthnDemo v-if="modalDemo === 'register'" mode="register" :lang="lang" />
        <WebAuthnDemo v-if="modalDemo === 'passkeyLogin'" mode="login" :lang="lang" />
        <ClassicDesktopDemo v-if="modalDemo === 'classicDesktop'" :lang="lang" />
        <ClassicMobileDemo v-if="modalDemo === 'classicMobile'" :lang="lang" />
        <SseDemo v-if="modalDemo === 'sseFlow'" :lang="lang" />
      </div>
    </Dialog>
  </main>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent, h } from "vue";

declare const EMOJIS: string[];
declare const CLAIM: string;
declare const featureCopy: Record<string, any[]>;
declare const flowCopy: Record<string, any[]>;
declare const demoItems: Record<string, any[]>;
declare const protections: Record<string, string[]>;
declare const limits: Record<string, string[]>;
declare const architecture: Record<string, any[]>;
declare const roadmapData: Record<string, any>;
declare const randomId: (prefix?: string) => string;
declare const randomIpv4Masked: () => string;
declare const randomBytes: (length?: number) => Uint8Array;
declare const bytesToBase64URL: (bytes: ArrayBuffer) => string;
type Lang = string;

const QrBox = defineComponent({
  props: { small: Boolean },
  setup(props) {
    return () => h("div", { class: ["qauth-qr mx-auto rounded-2xl border-8 border-white bg-white shadow-inner ring-1 ring-zinc-200", props.small ? "h-40 w-40" : "h-64 w-64"] });
  },
});

const EmojiStrip = defineComponent({
  props: { big: Boolean },
  setup(props) {
    return () => h("div", { class: "flex justify-center gap-2" }, EMOJIS.map((emoji) => h("span", { class: ["grid place-items-center rounded-xl bg-zinc-100 ring-1 ring-zinc-200", props.big ? "h-14 w-14 text-3xl" : "h-10 w-10 text-2xl"] }, emoji)));
  },
});

const InfoRow = defineComponent({
  props: { icon: String, label: String, value: String },
  setup(props) {
    return () => h("div", { class: "flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800" }, [
      h("div", { class: "grid h-10 w-10 place-items-center rounded-xl bg-white text-xl dark:bg-zinc-950" }, props.icon),
      h("div", { class: "min-w-0" }, [h("p", { class: "text-xs text-zinc-500" }, props.label), h("p", { class: "break-all text-sm font-medium" }, props.value)]),
    ]);
  },
});

const DemoFrame = defineComponent({
  props: { tag: String, title: String, subtitle: String },
  setup(props, { slots }) {
    return () => h("section", {}, [
      h("div", { class: "mb-5" }, [h("span", { class: "rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-900" }, props.tag), h("h2", { class: "mt-3 text-3xl font-bold tracking-tight" }, props.title), h("p", { class: "mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300" }, props.subtitle)]),
      slots.default?.(),
    ]);
  },
});

export const HomeView = defineComponent({
  props: { lang: { type: String, required: true }, copy: { type: Object, required: true } },
  emits: ["nav"],
  setup(props, { emit }) {
    return () => h("div", {}, [
      h("section", { class: "mx-auto max-w-7xl px-6 py-16 md:py-24" }, [
        h("div", { class: "grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]" }, [
          h("div", {}, [
            h(Badge, {}, () => props.copy.badge),
            h("h1", { class: "mt-4 text-[clamp(56px,8vw,108px)] font-black leading-[0.92] tracking-[-0.06em]" }, "QAuth"),
            h("h2", { class: "mt-3 max-w-3xl text-2xl font-semibold md:text-3xl" }, props.copy.subtitle),
            h("p", { class: "mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300" }, props.copy.desc),
            h("div", { class: "mt-8 flex flex-wrap gap-3" }, [h(Button, { size: "lg", onClick: () => emit("nav", "/demo") }, () => props.copy.cta1), h(Button, { variant: "outline", size: "lg", onClick: () => emit("nav", "/docs") }, () => props.copy.cta2)]),
          ]),
          h(Card, { class: "overflow-hidden p-5" }, () => [h("div", { class: "rounded-[2rem] bg-zinc-950 p-5 text-white" }, [h("div", { class: "mb-4 flex items-center justify-between" }, [h("div", {}, [h("p", { class: "text-sm text-zinc-400" }, props.lang === "zh" ? "登录 Banana" : "Sign in to Banana"), h("p", { class: "text-xl font-bold" }, props.lang === "zh" ? "使用可信设备安全登录" : "Secure sign-in with trusted device")]), h("div", { class: "rounded-2xl bg-white/10 p-3 text-2xl" }, "▦")]), h(QrBox, { small: true }), h("p", { class: "mt-4 text-center text-sm text-zinc-300" }, props.lang === "zh" ? "请用手机相机扫码" : "Scan with your phone camera"), h("div", { class: "mt-5" }, [h(EmojiStrip)])])]),
        ]),
      ]),
      h("section", { class: "mx-auto grid max-w-7xl gap-4 px-6 py-10 md:grid-cols-3" }, props.copy.capabilitiesItems.map((item: string) => h(Card, { class: "qauth-card-hover p-5" }, () => item))),
      h("section", { class: "mx-auto max-w-7xl px-6 py-10" }, [h("h3", { class: "text-2xl font-semibold" }, props.copy.flow), h(Card, { class: "mt-4 p-5 text-zinc-700 dark:text-zinc-300" }, () => props.copy.flowText)]),
      h("section", { class: "mx-auto max-w-7xl px-6 py-10" }, [h("h3", { class: "text-2xl font-semibold" }, props.copy.demoDocs), h("p", { class: "mt-3 text-zinc-600 dark:text-zinc-300" }, props.copy.demoText), h("div", { class: "mt-4 flex flex-wrap gap-3" }, [["/demo", props.copy.toDemo], ["/docs", props.copy.toDocs], ["/security", props.copy.toSecurity], ["/roadmap", props.copy.toRoadmap]].map(([href, label]) => h(Button, { variant: "outline", onClick: () => emit("nav", href) }, () => label)))]),
      h(RoadmapGrid, { lang: props.lang, copy: props.copy }),
    ]);
  },
});

export const DemoView = defineComponent({
  props: { lang: { type: String, required: true }, copy: { type: Object, required: true } },
  emits: ["open-demo"],
  setup(props, { emit }) {
    return () => h("div", {}, [
      h("section", { class: "mx-auto max-w-7xl px-6 py-16" }, [
        h("div", { class: "mb-6 flex flex-wrap gap-2" }, ["Passwordless", "Device-first", "QR approval", "PoW challenge"].map((p) => h(Badge, {}, () => p))),
        h("h1", { class: "max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl" }, [props.copy.heroA, h("span", { class: "block bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent" }, props.copy.heroB)]),
        h("p", { class: "mt-6 max-w-2xl text-lg leading-9 text-zinc-600 dark:text-zinc-300" }, props.copy.heroDesc),
        h("div", { class: "mt-6 flex flex-wrap items-center gap-3 text-sm" }, [h(Badge, {}, () => [h(ShieldCheck, { size: 14 }), " Device-first"]), h(Badge, {}, () => [h(GitBranch, { size: 14 }), " GitHub-inspired UI"]), h(Badge, {}, () => [h(Sparkles, { size: 14 }), " Better readability"])]),
      ]),
      h("section", { id: "capabilities", class: "mx-auto max-w-7xl px-6 py-10" }, [h(SectionTitle, { eyebrow: props.copy.nav[1], title: props.copy.capabilities, desc: props.copy.codeDesc }), h("div", { class: "mt-6 grid gap-4 md:grid-cols-4" }, featureCopy[props.lang as Lang].map((f) => h(Card, { class: "qauth-card-hover p-5" }, () => [h("div", { class: "text-3xl" }, f.icon), h("h3", { class: "mt-4 font-semibold" }, f.title), h("p", { class: "mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300" }, f.desc)])))]),
      h("section", { id: "flow", class: "mx-auto max-w-7xl px-6 py-10" }, [h(SectionTitle, { eyebrow: props.copy.nav[2], title: props.copy.flow, desc: props.copy.flowText }), h("div", { class: "mt-6 grid gap-4 md:grid-cols-2" }, flowCopy[props.lang as Lang].map((flow) => h(Card, { class: "p-5" }, () => [h(Badge, {}, () => flow.label), h("h3", { class: "mt-3 text-xl font-semibold" }, flow.title), h("ol", { class: "mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300" }, flow.steps.map((step, index) => h("li", {}, `${index + 1}. ${step}`)))])))]),
      h("section", { id: "demos", class: "mx-auto max-w-7xl px-6 py-10" }, [h(SectionTitle, { eyebrow: props.copy.nav[3], title: props.lang === "zh" ? "完整演示功能" : "Complete Demo Set", desc: props.lang === "zh" ? "保留全部 8 个演示：扫码、手机确认、计算挑战、Passkey 注册、Passkey 登录、领取码、手机领取码、SSE 状态流。" : "All eight demos are preserved: QR, mobile approval, proof-of-work, passkey registration, passkey login, claim code, mobile claim code, and SSE status stream." }), h("div", { class: "mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" }, demoItems[props.lang as Lang].map((demo) => h(Card, { class: "qauth-card-hover flex flex-col p-5" }, () => [h("div", { class: "text-3xl" }, demo.icon), h("h3", { class: "mt-4 font-semibold" }, demo.title), h("p", { class: "mt-2 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300" }, demo.desc), h(Button, { class: "mt-4", variant: "outline", onClick: () => emit("open-demo", demo.id) }, () => props.copy.openDemo)])))]),
      h("section", { id: "security", class: "mx-auto grid max-w-7xl gap-4 px-6 py-10 md:grid-cols-2" }, [h(ListCard, { title: props.lang === "zh" ? "安全边界" : "Security boundaries", items: protections[props.lang as Lang] }), h(ListCard, { title: props.lang === "zh" ? "不能承诺" : "Non-goals", items: limits[props.lang as Lang] })]),
      h("section", { class: "mx-auto max-w-7xl px-6 py-10" }, [h("div", { class: "grid gap-4 md:grid-cols-4" }, architecture[props.lang as Lang].map((a) => h(Card, { class: "p-5" }, () => [h("div", { class: "text-3xl" }, a.icon), h("h3", { class: "mt-3 font-semibold" }, a.title), h("ul", { class: "mt-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-300" }, a.items.map((x) => h("li", {}, `• ${x}`)))])))]),
      h(RoadmapGrid, { lang: props.lang, copy: props.copy }),
    ]);
  },
});

const SectionTitle = defineComponent({ props: { eyebrow: String, title: String, desc: String }, setup(props) { return () => h("div", {}, [h(Badge, {}, () => props.eyebrow), h("h2", { class: "mt-3 text-3xl font-bold tracking-tight" }, props.title), h("p", { class: "mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300" }, props.desc)]); } });
const ListCard = defineComponent({ props: { title: String, items: Array }, setup(props) { return () => h(Card, { class: "p-5" }, () => [h("h3", { class: "text-xl font-semibold" }, props.title), h("ul", { class: "mt-4 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300" }, (props.items as string[]).map((item) => h("li", {}, `• ${item}`)))]); } });
const RoadmapGrid = defineComponent({ props: { lang: { type: String, required: true }, copy: { type: Object, required: true } }, setup(props) { return () => h("section", { class: "mx-auto max-w-7xl px-6 py-12" }, [h("h3", { class: "text-2xl font-semibold" }, props.copy.roadmap), h("div", { class: "mt-4 grid gap-4 md:grid-cols-3" }, [[props.copy.now, roadmapData[props.lang as Lang].now], [props.copy.building, roadmapData[props.lang as Lang].building], [props.copy.next, roadmapData[props.lang as Lang].next]].map(([title, items]) => h(Card, { class: "qauth-card-hover p-5" }, () => [h("h4", { class: "font-semibold" }, title as string), h("ul", { class: "mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300" }, (items as string[]).map((item) => h("li", {}, `• ${item}`)))]))) ]); } });

export const DocsView = defineComponent({ props: { copy: { type: Object, required: true } }, emits: ["nav"], setup(props, { emit }) { return () => h("section", { class: "mx-auto max-w-5xl px-6 py-20" }, [h("h1", { class: "text-4xl font-semibold" }, props.copy.docsTitle), h("p", { class: "mt-4 text-zinc-600 dark:text-zinc-300" }, props.copy.docsDesc), h("div", { class: "mt-8 grid gap-4 md:grid-cols-2" }, props.copy.docsItems.map((i: string) => h(Card, { class: "qauth-card-hover p-5" }, () => i))), h(Button, { class: "mt-8", variant: "outline", onClick: () => emit("nav", "/demo") }, () => props.copy.backDemo)]); } });
export const SecurityView = defineComponent({ props: { copy: { type: Object, required: true } }, setup(props) { return () => h("section", { class: "mx-auto max-w-4xl px-6 py-20" }, [h(Card, { class: "p-8" }, () => [h("h1", { class: "text-4xl font-semibold" }, props.copy.securityTitle), h("ol", { class: "mt-6 space-y-3 text-zinc-600 dark:text-zinc-300" }, props.copy.securitySteps.map((s: string, i: number) => h("li", {}, `${i + 1}. ${s}`)))])]); } });
export const RoadmapView = defineComponent({ props: { lang: { type: String, required: true }, copy: { type: Object, required: true } }, setup(props) { return () => h(RoadmapGrid, { lang: props.lang, copy: props.copy }); } });

export const DesktopQrDemo = defineComponent({ props: { lang: String }, setup(props) { const sid = ref(randomId()); const ip = ref(randomIpv4Masked()); const nonce = ref("9f7a2c1b"); const ua = ref("Chrome on Windows 11"); const payload = computed(() => `https://auth.example.com/scan?sid=${sid.value}&nonce=${nonce.value}`); const refresh = () => { sid.value = randomId(); ip.value = randomIpv4Masked(); nonce.value = Math.random().toString(36).slice(2, 16); ua.value = navigator.userAgent.slice(0, 42) + "..."; }; return () => h(DemoFrame, { tag: props.lang === "zh" ? "电脑扫码" : "Desktop QR", title: props.lang === "zh" ? "电脑二维码登录页" : "Desktop QR sign-in page", subtitle: props.lang === "zh" ? "电脑显示二维码、请求符号、IP、地点、浏览器信息。" : "Desktop shows QR, request symbols, IP, location, and browser details." }, () => h("div", { class: "grid gap-5 lg:grid-cols-2" }, [h(Card, { class: "p-5 space-y-3" }, () => [h(InfoRow, { icon: "🧩", label: props.lang === "zh" ? "会话" : "Session", value: sid.value }), h(InfoRow, { icon: "🌐", label: "IP", value: ip.value }), h(InfoRow, { icon: "💻", label: props.lang === "zh" ? "浏览器" : "Browser", value: ua.value }), h(InfoRow, { icon: "📍", label: props.lang === "zh" ? "登录地点" : "Location", value: props.lang === "zh" ? "广东 · 中国" : "Guangdong · China" }), h(EmojiStrip), h(Button, { variant: "outline", onClick: refresh }, () => props.lang === "zh" ? "重新生成" : "Regenerate")]), h(Card, { class: "grid place-items-center p-8" }, () => [h(QrBox), h("pre", { class: "mt-5 w-full whitespace-pre-wrap break-all rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100" }, payload.value)])])); } });
export const MobileConfirmDemo = defineComponent({ props: { lang: String }, setup(props) { const picked = ref(["", "", "", ""]); const matched = computed(() => picked.value.join("") === EMOJIS.join("")); return () => h(DemoFrame, { tag: props.lang === "zh" ? "手机确认" : "Mobile approval", title: props.lang === "zh" ? "手机扫码确认页" : "Phone QR approval page", subtitle: props.lang === "zh" ? "手机扫码后核对请求符号，再确认登录电脑。" : "Phone checks request symbols before approving desktop sign-in." }, () => h(Card, { class: "mx-auto max-w-md overflow-hidden" }, () => [h("div", { class: "bg-zinc-950 p-5 text-white" }, [h("p", { class: "text-xs tracking-[0.2em] text-zinc-400" }, props.lang === "zh" ? "手机安全确认" : "Mobile security approval"), h("h2", { class: "mt-1 text-2xl font-semibold" }, props.lang === "zh" ? "确认登录 Banana" : "Approve sign-in to Banana")]), h("div", { class: "space-y-4 p-5" }, [h(InfoRow, { icon: "💻", label: props.lang === "zh" ? "请求设备" : "Request device", value: "Chrome on Windows 11" }), h(InfoRow, { icon: "🌐", label: props.lang === "zh" ? "登录地址" : "IP address", value: "223.104.68.xxx" }), h("div", { class: "grid grid-cols-4 gap-2" }, picked.value.map((v, i) => h("button", { class: "h-12 rounded-xl bg-zinc-100 text-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800", onClick: () => picked.value = picked.value.map((x, idx) => idx === i ? EMOJIS[i] : x) }, v || "?"))), h(Button, { class: "h-12 w-full", disabled: !matched.value }, () => matched.value ? (props.lang === "zh" ? "已匹配，确认登录" : "Matched, approve sign-in") : (props.lang === "zh" ? "等待匹配" : "Waiting for match"))]) ])); } });
export const ProofChallengeDemo = defineComponent({ props: { lang: String }, setup(props) { const running = ref(false); const answer = ref(""); const attempts = ref(0); const run = async () => { running.value = true; answer.value = ""; attempts.value = 0; for (let i = 0; i < 50000; i++) { attempts.value = i + 1; const text = `qauth-demo:${i}`; const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)); const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join(""); if (hex.startsWith("000")) { answer.value = `${text}\n${hex}`; break; } } running.value = false; }; return () => h(DemoFrame, { tag: props.lang === "zh" ? "计算挑战" : "Proof-of-work", title: props.lang === "zh" ? "计算挑战验证码" : "Proof-of-work challenge", subtitle: props.lang === "zh" ? "纯前端寻找哈希答案，演示工作量证明式验证码。" : "The browser searches for a hash answer locally." }, () => h(Card, { class: "p-5" }, () => [h("div", { class: "h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900" }, h("div", { class: "qauth-pulse-line h-full bg-sky-500", style: { width: running.value ? "80%" : answer.value ? "100%" : "10%" } })), h("p", { class: "mt-4 text-sm text-zinc-600 dark:text-zinc-300" }, `${props.lang === "zh" ? "尝试次数" : "Attempts"}: ${attempts.value}`), h(Button, { class: "mt-4", disabled: running.value, onClick: run }, () => running.value ? (props.lang === "zh" ? "计算中..." : "Solving...") : (props.lang === "zh" ? "开始挑战" : "Start challenge")), h("pre", { class: "mt-4 min-h-28 whitespace-pre-wrap break-all rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100" }, answer.value || (props.lang === "zh" ? "// 结果显示在这里" : "// Result appears here"))])); } });
export const WebAuthnDemo = defineComponent({ props: { lang: String, mode: String }, setup(props) { const status = ref(props.mode === "register" ? (props.lang === "zh" ? "等待注册" : "Waiting to register") : (props.lang === "zh" ? "等待登录" : "Waiting to sign in")); const output = ref(""); const done = ref(false); const run = async () => { try { if (props.mode === "register") { const credential = await navigator.credentials.create({ publicKey: { challenge: randomBytes(32), rp: { name: "QAuth Demo", id: location.hostname }, user: { id: randomBytes(16), name: "QAuth@display.auth", displayName: "QAuth@display.auth" }, pubKeyCredParams: [{ type: "public-key", alg: -7 }], authenticatorSelection: { residentKey: "required", userVerification: "required" }, timeout: 60000 } as PublicKeyCredentialCreationOptions }); done.value = true; status.value = props.lang === "zh" ? "注册成功" : "Registration succeeded"; const c = credential as PublicKeyCredential; output.value = JSON.stringify({ id: c.id, rawId: bytesToBase64URL(c.rawId), type: c.type }, null, 2); } else { const credential = await navigator.credentials.get({ publicKey: { challenge: randomBytes(32), userVerification: "required", timeout: 60000 } as PublicKeyCredentialRequestOptions }); status.value = props.lang === "zh" ? "登录验证成功" : "Assertion succeeded"; const c = credential as PublicKeyCredential; output.value = JSON.stringify({ id: c.id, rawId: bytesToBase64URL(c.rawId), type: c.type }, null, 2); } } catch (e) { const err = e as Error; status.value = props.lang === "zh" ? "失败或取消" : "Failed or cancelled"; output.value = JSON.stringify({ name: err.name, message: err.message }, null, 2); } }; return () => h(DemoFrame, { tag: props.mode === "register" ? (props.lang === "zh" ? "注册通行密钥" : "Passkey registration") : (props.lang === "zh" ? "通行密钥登录" : "Passkey login"), title: props.mode === "register" ? (props.lang === "zh" ? "注册通行密钥" : "Passkey Registration") : (props.lang === "zh" ? "通行密钥登录" : "Passkey Login"), subtitle: props.lang === "zh" ? "调用浏览器 WebAuthn 能力并显示返回数据。" : "Calls browser WebAuthn APIs and prints returned data." }, () => h(Card, { class: "p-5" }, () => [h("div", { class: "rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900" }, status.value), h(Button, { class: "mt-4", disabled: done.value && props.mode === "register", onClick: run }, () => props.mode === "register" ? (done.value ? "✅ " + (props.lang === "zh" ? "凭据已创建" : "Credential created") : (props.lang === "zh" ? "创建通行密钥" : "Create passkey")) : (props.lang === "zh" ? "使用通行密钥登录" : "Sign in with passkey")), h("pre", { class: "mt-4 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100" }, output.value || (props.lang === "zh" ? "// 返回数据显示在这里" : "// Response data appears here"))])); } });
export const ClassicDesktopDemo = defineComponent({ props: { lang: String }, setup(props) { const value = ref(""); const done = ref(false); const valid = computed(() => value.value.trim().toUpperCase() === CLAIM); return () => h(DemoFrame, { tag: props.lang === "zh" ? "电脑领取码" : "Desktop claim code", title: props.lang === "zh" ? "电脑端领取码登录" : "Desktop claim-code sign-in", subtitle: props.lang === "zh" ? "用于没有实时通道的老浏览器：手机完成验证后显示一次性领取码，电脑手动输入。" : "Fallback for legacy browsers: phone shows a one-time code and desktop enters it manually." }, () => h("div", { class: "grid gap-5 lg:grid-cols-2" }, [h(Card, { class: "p-8" }, () => [h(QrBox, { small: true }), h("p", { class: "mt-5 text-center text-sm font-medium" }, props.lang === "zh" ? "电脑屏幕验证符号" : "Desktop verification symbols"), h(EmojiStrip)]), h(Card, { class: "p-8" }, () => [h("h2", { class: "text-2xl font-semibold" }, props.lang === "zh" ? "输入手机上的一次性登录码" : "Enter the one-time code from phone"), h("p", { class: "mt-3 text-sm text-zinc-600 dark:text-zinc-300" }, `${props.lang === "zh" ? "演示码" : "Demo code"}: ${CLAIM}`), h("input", { value: value.value, onInput: (e: Event) => value.value = (e.target as HTMLInputElement).value, placeholder: CLAIM, class: "mt-6 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 font-mono text-sm outline-none focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950" }), h(Button, { class: "mt-4 h-12 w-full", disabled: !valid.value || done.value, onClick: () => done.value = true }, () => done.value ? ("✅ " + (props.lang === "zh" ? "登录成功" : "Sign-in succeeded")) : (props.lang === "zh" ? "→ 提交登录码" : "→ Submit code")), done.value ? h("div", { class: "mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100" }, props.lang === "zh" ? "演示：电脑已拿到登录结果。真实项目中，服务器会在当前电脑响应里设置安全会话。" : "Demo: desktop received the login result. In production, the server sets a secure session in this desktop response.") : null]) ])); } });
export const ClassicMobileDemo = defineComponent({ props: { lang: String }, setup(props) { const step = ref(0); return () => h(DemoFrame, { tag: props.lang === "zh" ? "手机领取码" : "Mobile claim code", title: props.lang === "zh" ? "手机端返回领取码" : "Mobile returns claim code", subtitle: props.lang === "zh" ? "手机验证成功后显示一次性登录码，用于没有实时通道的电脑浏览器。" : "After phone verification, a one-time code is shown for desktop browsers without realtime channels." }, () => h(Card, { class: "mx-auto max-w-md overflow-hidden" }, () => [h("div", { class: "bg-zinc-950 p-5 text-white" }, [h("p", { class: "text-xs tracking-[0.2em] text-zinc-400" }, props.lang === "zh" ? "手机备用登录" : "Mobile fallback sign-in"), h("h2", { class: "mt-1 text-2xl font-semibold" }, props.lang === "zh" ? "返回一次性登录码" : "Return one-time claim code")]), h("div", { class: "space-y-4 p-5" }, [h(InfoRow, { icon: "💻", label: props.lang === "zh" ? "请求设备" : "Request device", value: "Chrome on Windows 11" }), h(InfoRow, { icon: "📍", label: props.lang === "zh" ? "登录地点" : "Location", value: props.lang === "zh" ? "广东 · 中国" : "Guangdong · China" }), step.value === 0 ? h("div", { class: "space-y-4" }, [h("div", { class: "rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800" }, [h("p", { class: "mb-3 text-sm font-medium" }, props.lang === "zh" ? "请核对电脑屏幕上的符号" : "Check the symbols on the desktop screen"), h(EmojiStrip)]), h(Button, { class: "h-12 w-full", onClick: () => step.value = 1 }, () => props.lang === "zh" ? "👤 模拟设备验证" : "👤 Simulate device verification")]) : h("div", { class: "space-y-4" }, [h("div", { class: "rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100" }, props.lang === "zh" ? "✅ 手机验证成功。请把下面的一次性登录码输入电脑页面。真实项目中它应该 60 秒过期并且只能使用一次。" : "✅ Phone verification succeeded. Enter the code below on desktop. In production it should expire in 60 seconds and be one-time use."), h("div", { class: "rounded-2xl bg-zinc-950 p-5 text-center text-white" }, [h("p", { class: "text-xs tracking-[0.2em] text-zinc-400" }, props.lang === "zh" ? "一次性登录码" : "One-time sign-in code"), h("p", { class: "mt-3 select-all font-mono text-2xl font-semibold tracking-wider" }, CLAIM)]), h(Button, { variant: "outline", class: "h-12 w-full" }, () => props.lang === "zh" ? "📋 复制登录码" : "📋 Copy code")])]) ])); } });
export const SseDemo = defineComponent({ props: { lang: String }, setup(props) { const index = ref(0); const events = computed(() => props.lang === "zh" ? ["连接已建立", "服务端推送：手机已扫码", "服务端推送：手机已确认", "电脑领取会话完成", "连接关闭，可重放"] : ["Connection opened", "Server event: phone scanned", "Server event: phone approved", "Desktop claimed session", "Connection closed, replay available"]); let timer: number | undefined; const play = () => { index.value = 0; window.clearInterval(timer); timer = window.setInterval(() => { if (index.value >= events.value.length - 1) window.clearInterval(timer); else index.value += 1; }, 900); }; return () => h(DemoFrame, { tag: props.lang === "zh" ? "SSE 通信" : "SSE stream", title: props.lang === "zh" ? "SSE 通信演示" : "SSE stream demo", subtitle: props.lang === "zh" ? "自动播放服务端事件流状态，展示连接、推送、完成与重连。" : "Auto-play server event stream states: connect, push, finish, and replay." }, () => h(Card, { class: "p-5" }, () => [h(Button, { onClick: play }, () => props.lang === "zh" ? "重放事件流" : "Replay event stream"), h("div", { class: "mt-5 space-y-3" }, events.value.map((event, i) => h("div", { class: ["rounded-2xl p-4 text-sm ring-1", i <= index.value ? "bg-emerald-50 text-emerald-900 ring-emerald-100" : "bg-zinc-50 text-zinc-500 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"] }, `${i <= index.value ? "✅" : "○"} ${event}`)))])); } });
</script>
