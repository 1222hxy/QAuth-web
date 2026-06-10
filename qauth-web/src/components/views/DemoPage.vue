<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Check, ChevronDown, Circle, Fingerprint, KeyRound, Laptop, Pause, Play, RotateCcw, ShieldCheck, Smartphone } from "lucide-vue-next";
import Button from "../ui/Button.vue";
import Card from "../ui/Card.vue";
import RealQrCode from "../demos/RealQrCode.vue";
import { createLoginSession } from "../../lib/qauth-demo";
import { createDemoPasskey, getDemoPasskeyAssertion, getWebAuthnEnvironment, type DemoPasskeyAssertionResult, type DemoPasskeyCreationResult, type WebAuthnEnvironment } from "../../lib/webauthn";
import type { Lang } from "../../types";

type DemoMode = "standard" | "webauthn" | "mobile" | "device" | "proof";
type DemoStep = { id: string; title: string; description: string; status: string };
type WebAuthnStatus = "Ready" | "Prompt Opened" | "Passkey Created" | "Authenticator Prompt" | "Assertion Returned" | "Client Data Verified" | "Demo Sign-in Complete" | "Failed" | "Canceled" | "Waiting for Credential";

const props = defineProps<{ lang: Lang }>();
const emit = defineEmits<{ navigate: [to: string] }>();

const dictionary = {
  zh: {
    backHome: "返回首页",
    title: "实时认证演示",
    subtitle: "体验 QAuth 如何通过 Passkey、桌面扫码、手机确认、可信设备识别与会话验证完成一次安全登录。",
    productionNote: "此 Demo 仅在前端展示 WebAuthn 调用和返回结果。生产环境必须在服务端校验 challenge、origin、RP ID、签名、计数器和用户绑定关系。",
    unavailable: "当前环境不支持 WebAuthn。请使用 HTTPS 域名、localhost，或支持 Passkey 的现代浏览器，并确保页面不在 iframe 中运行。",
    modes: [
      { id: "standard", label: "标准流程" },
      { id: "webauthn", label: "WebAuthn / Passkey" },
      { id: "mobile", label: "手机确认" },
      { id: "device", label: "可信设备" },
      { id: "proof", label: "计算挑战" },
    ] as const,
    controls: { prev: "上一步", next: "下一步", play: "自动播放", pause: "暂停演示", reset: "重置" },
    details: { view: "查看技术细节", hide: "收起技术细节" },
    webauthn: { env: "环境检测", create: "创建 Passkey", createDesc: "调用浏览器 WebAuthn API 创建一个绑定当前 RP ID 的演示凭据。", get: "使用 Passkey 登录", getDesc: "使用刚创建的凭据发起一次真实的 WebAuthn authentication ceremony。", clear: "清除本地演示记录" },
    labels: { secure: "Secure Context", api: "WebAuthn API", platform: "Platform Authenticator", top: "Top-level Context", rp: "RP ID", origin: "Origin", available: "Available", unavailable: "Unavailable", required: "Required", unknown: "Unknown", yes: "Yes", no: "No", pending: "Pending", completed: "Completed", passed: "Passed", failed: "Failed" },
    steps: {
      standard: [
        { id: "request", title: "发起登录请求", description: "用户在桌面端点击登录按钮，应用向 QAuth 请求一次新的认证流程。", status: "Login Requested" },
        { id: "challenge", title: "创建短时效 Challenge", description: "QAuth 生成一次性 challenge，并为当前会话设置有效时间。", status: "Challenge Created" },
        { id: "qr", title: "展示扫码确认", description: "桌面端显示二维码，用户使用已绑定设备扫描并查看登录详情。", status: "Waiting for Approval" },
        { id: "approve", title: "手机端批准", description: "用户在手机端确认本次登录请求，避免静默授权或误操作。", status: "Approved on Trusted Device" },
        { id: "device", title: "识别可信设备", description: "QAuth 校验设备绑定关系，并确认请求来自可信上下文。", status: "Device Recognized" },
        { id: "verified", title: "完成会话验证", description: "认证通过后，应用获得已验证 session，用户安全进入系统。", status: "Session Verified" },
      ],
      webauthn: [
        { id: "request", title: "发起 Passkey 登录", description: "用户选择使用 Passkey 登录，应用向 QAuth 请求一次新的 WebAuthn challenge。", status: "Passkey Requested" },
        { id: "challenge", title: "创建 WebAuthn Challenge", description: "QAuth 生成短时效 challenge，并将 Relying Party、User Verification 和认证策略返回给浏览器。", status: "Challenge Created" },
        { id: "prompt", title: "调用平台认证器", description: "浏览器调用设备内置认证器，用户通过设备解锁、指纹或面容验证确认身份。", status: "Authenticator Prompt" },
        { id: "assertion", title: "验证认证响应", description: "应用将 WebAuthn assertion 返回给 QAuth。此 Demo 仅在前端展示返回结果和基础 clientData 校验。", status: "Assertion Returned" },
        { id: "complete", title: "完成演示登录", description: "基础校验通过后，页面展示 Demo Session Verified。生产环境仍必须由服务端完成签名和用户绑定验证。", status: "Demo Session Verified" },
      ],
      mobile: [
        { id: "scan", title: "手机端确认请求", description: "手机端展示应用、浏览器、设备与位置，让用户确认这次登录是否可信。", status: "Request Reviewed" },
        { id: "approve", title: "明确批准或拒绝", description: "Approve 是主按钮，Deny 保持弱样式，减少误触造成的静默授权。", status: "Mobile Approval" },
        { id: "complete", title: "返回桌面会话", description: "手机端确认后，桌面端只领取本次短时效会话。", status: "Session Approved" },
      ],
      device: [
        { id: "match", title: "识别可信设备", description: "QAuth 检查设备密钥、近期验证时间和浏览器绑定。", status: "Trusted Device" },
        { id: "context", title: "确认请求上下文", description: "设备、浏览器与会话必须处于同一个可信上下文。", status: "Device Recognized" },
        { id: "verified", title: "完成设备验证", description: "可信设备验证通过后，认证继续进入会话验证。", status: "Verified Device" },
      ],
      proof: [
        { id: "received", title: "Challenge Received", description: "浏览器收到短时效 challenge 和难度要求。", status: "Challenge Received" },
        { id: "search", title: "Nonce Search Started", description: "浏览器执行轻量工作量证明，降低自动化请求风险。", status: "Nonce Search Started" },
        { id: "generated", title: "Proof Generated", description: "找到满足前缀难度的 nonce，长 hash 在界面中截断展示。", status: "Proof Generated" },
        { id: "submitted", title: "Proof Submitted", description: "QAuth 校验 challenge、nonce、hash 与过期窗口。", status: "Proof Submitted" },
        { id: "continued", title: "Authentication Continued", description: "证明验证通过后，流程继续进入可信设备确认。", status: "Authentication Continued" },
      ],
    },
  },
  en: {
    backHome: "Back to Home",
    title: "Live Authentication Demo",
    subtitle: "See how QAuth completes a secure sign-in with passkeys, QR confirmation, mobile approval, trusted device recognition and session verification.",
    productionNote: "This demo shows the browser WebAuthn call and returned credential data on the client. Production systems must verify the challenge, origin, RP ID, signature, counter and user binding on the server.",
    unavailable: "WebAuthn is not available in this environment. Use an HTTPS origin, localhost, or a modern browser with passkey support, and make sure the page is not running inside an iframe.",
    modes: [
      { id: "standard", label: "Standard Flow" },
      { id: "webauthn", label: "WebAuthn / Passkey" },
      { id: "mobile", label: "Mobile Approval" },
      { id: "device", label: "Trusted Device" },
      { id: "proof", label: "Proof Challenge" },
    ] as const,
    controls: { prev: "Previous", next: "Next", play: "Auto Play", pause: "Pause", reset: "Reset" },
    details: { view: "View Technical Details", hide: "Hide Technical Details" },
    webauthn: { env: "Environment Check", create: "Create Passkey", createDesc: "Call the browser WebAuthn API to create a demo credential bound to the current RP ID.", get: "Use Passkey", getDesc: "Use the credential just created to start a real WebAuthn authentication ceremony.", clear: "Clear Local Demo Record" },
    labels: { secure: "Secure Context", api: "WebAuthn API", platform: "Platform Authenticator", top: "Top-level Context", rp: "RP ID", origin: "Origin", available: "Available", unavailable: "Unavailable", required: "Required", unknown: "Unknown", yes: "Yes", no: "No", pending: "Pending", completed: "Completed", passed: "Passed", failed: "Failed" },
    steps: {
      standard: [
        { id: "request", title: "Request Sign-In", description: "The user clicks sign in on desktop, and the app requests a new authentication flow from QAuth.", status: "Login Requested" },
        { id: "challenge", title: "Create Short-Lived Challenge", description: "QAuth generates a one-time challenge and sets an expiry for the current session.", status: "Challenge Created" },
        { id: "qr", title: "Show QR Confirmation", description: "The desktop shows a QR code so the user can scan with a bound device and review sign-in details.", status: "Waiting for Approval" },
        { id: "approve", title: "Approve on Mobile", description: "The user explicitly approves the request on mobile, avoiding silent authorization or accidental sign-ins.", status: "Approved on Trusted Device" },
        { id: "device", title: "Recognize Trusted Device", description: "QAuth verifies the device binding and confirms the request came from a trusted context.", status: "Device Recognized" },
        { id: "verified", title: "Verify Session", description: "After authentication succeeds, the app receives a verified session and safely continues to the workspace.", status: "Session Verified" },
      ],
      webauthn: [
        { id: "request", title: "Request Passkey Sign-In", description: "The user chooses passkey sign-in, and the app requests a new WebAuthn challenge from QAuth.", status: "Passkey Requested" },
        { id: "challenge", title: "Create WebAuthn Challenge", description: "QAuth returns Relying Party, user verification and authentication policy details to the browser.", status: "Challenge Created" },
        { id: "prompt", title: "Invoke Platform Authenticator", description: "The browser calls the device authenticator so the user can confirm with unlock, fingerprint or face verification.", status: "Authenticator Prompt" },
        { id: "assertion", title: "Verify Authentication Assertion", description: "The app returns the WebAuthn assertion to QAuth. This demo only shows returned data and basic clientData checks on the client.", status: "Assertion Returned" },
        { id: "complete", title: "Complete Demo Sign-in", description: "After the basic check passes, the page shows Demo Session Verified. Production still requires server-side signature and user-binding verification.", status: "Demo Session Verified" },
      ],
      mobile: [
        { id: "scan", title: "Review the Request", description: "The mobile screen shows app, browser, device and location so the user can decide whether the request is trusted.", status: "Request Reviewed" },
        { id: "approve", title: "Approve or Deny", description: "Approve is the primary action while Deny remains secondary, reducing accidental authorization.", status: "Mobile Approval" },
        { id: "complete", title: "Return the Desktop Session", description: "After mobile approval, the desktop claims only this short-lived session.", status: "Session Approved" },
      ],
      device: [
        { id: "match", title: "Match Trusted Device", description: "QAuth checks the device key, recent verification time and browser binding.", status: "Trusted Device" },
        { id: "context", title: "Confirm Request Context", description: "Device, browser and session must all belong to the same trusted context.", status: "Device Recognized" },
        { id: "verified", title: "Complete Device Verification", description: "Once the trusted device passes verification, authentication can proceed to session verification.", status: "Verified Device" },
      ],
      proof: [
        { id: "received", title: "Challenge Received", description: "The browser receives a short-lived challenge and a difficulty requirement.", status: "Challenge Received" },
        { id: "search", title: "Nonce Search Started", description: "The browser performs a lightweight proof-of-work to reduce automated request risk.", status: "Nonce Search Started" },
        { id: "generated", title: "Proof Generated", description: "A nonce satisfying the prefix difficulty is found, while the long hash is truncated in the UI.", status: "Proof Generated" },
        { id: "submitted", title: "Proof Submitted", description: "QAuth verifies the challenge, nonce, hash and expiry window.", status: "Proof Submitted" },
        { id: "continued", title: "Authentication Continued", description: "After proof verification passes, the flow continues to trusted device confirmation.", status: "Authentication Continued" },
      ],
    },
  },
};

const session = createLoginSession();
const activeMode = ref<DemoMode>("standard");
const activeStep = ref(0);
const isPlaying = ref(false);
const showDetails = ref(false);
const prefersReducedMotion = ref(false);
const env = ref<WebAuthnEnvironment | null>(null);
const createResult = ref<DemoPasskeyCreationResult | null>(null);
const getResult = ref<DemoPasskeyAssertionResult | null>(null);
const webauthnStatus = ref<WebAuthnStatus>("Ready");
const webauthnError = ref("");
const isCreating = ref(false);
const isGetting = ref(false);
let playTimer: number | undefined;
let reducedMotionQuery: MediaQueryList | null = null;

const t = computed(() => dictionary[props.lang]);
const modes = computed(() => t.value.modes);
const currentSteps = computed<DemoStep[]>(() => t.value.steps[activeMode.value]);
const currentStep = computed(() => currentSteps.value[activeStep.value] ?? currentSteps.value[0]);
const progress = computed(() => (currentSteps.value.length <= 1 ? 100 : (activeStep.value / (currentSteps.value.length - 1)) * 100));
const isComplete = computed(() => activeStep.value >= currentSteps.value.length - 1);
const shortBinding = computed(() => `${session.browserBinding.slice(0, 4)}…${session.browserBinding.slice(-4)}`);
const proofAttempts = computed(() => [0, 12480, 482910, 482910, 482910][Math.min(activeStep.value, 4)] ?? 482910);
const webauthnAvailable = computed(() => !!env.value?.isSecureContext && !!env.value?.isTopLevelContext && !!env.value?.hasPublicKeyCredential && !!env.value?.hasCredentialsApi);
const clientCheckPassed = computed(() => !!createResult.value?.check.passed && (!getResult.value || getResult.value.check.passed));

onMounted(async () => {
  reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion.value = reducedMotionQuery.matches;
  reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
  env.value = await getWebAuthnEnvironment();
  const saved = localStorage.getItem("qauth-demo-passkey-raw-id");
  if (saved) webauthnStatus.value = "Waiting for Credential";
});

onBeforeUnmount(() => {
  clearPlayTimer();
  reducedMotionQuery?.removeEventListener("change", handleMotionPreferenceChange);
});

watch(activeMode, () => {
  resetDemo();
  showDetails.value = false;
});

watch(isPlaying, (playing) => {
  clearPlayTimer();
  if (!playing || prefersReducedMotion.value) {
    if (prefersReducedMotion.value) isPlaying.value = false;
    return;
  }
  playTimer = window.setInterval(() => {
    if (isComplete.value) {
      isPlaying.value = false;
      clearPlayTimer();
      return;
    }
    nextStep();
  }, 1800);
});

function handleMotionPreferenceChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches;
  if (event.matches) resetDemo();
}

function clearPlayTimer() {
  window.clearInterval(playTimer);
  playTimer = undefined;
}

function selectMode(mode: DemoMode) {
  activeMode.value = mode;
}

function nextStep() {
  activeStep.value = Math.min(activeStep.value + 1, currentSteps.value.length - 1);
  if (isComplete.value) isPlaying.value = false;
}

function prevStep() {
  activeStep.value = Math.max(activeStep.value - 1, 0);
}

function resetDemo() {
  activeStep.value = 0;
  isPlaying.value = false;
  clearPlayTimer();
}

function togglePlayback() {
  if (isComplete.value) activeStep.value = 0;
  isPlaying.value = !isPlaying.value;
}

async function createPasskey() {
  isCreating.value = true;
  webauthnError.value = "";
  webauthnStatus.value = "Prompt Opened";
  try {
    createResult.value = await createDemoPasskey();
    localStorage.setItem("qauth-demo-passkey-raw-id", createResult.value.rawId);
    localStorage.setItem("qauth-demo-passkey-id", createResult.value.id);
    webauthnStatus.value = createResult.value.check.passed ? "Passkey Created" : "Failed";
    activeStep.value = Math.max(activeStep.value, 2);
  } catch (error) {
    handleWebAuthnError(error);
  } finally {
    isCreating.value = false;
  }
}

async function usePasskey() {
  const rawId = createResult.value?.rawId ?? localStorage.getItem("qauth-demo-passkey-raw-id");
  if (!rawId) {
    webauthnStatus.value = "Waiting for Credential";
    webauthnError.value = props.lang === "zh" ? "请先创建 Passkey，再使用它完成登录演示。" : "Create a passkey before using it for this sign-in demo.";
    return;
  }
  isGetting.value = true;
  webauthnError.value = "";
  webauthnStatus.value = "Authenticator Prompt";
  try {
    getResult.value = await getDemoPasskeyAssertion(rawId);
    webauthnStatus.value = getResult.value.check.passed ? "Demo Sign-in Complete" : "Assertion Returned";
    activeStep.value = Math.max(activeStep.value, getResult.value.check.passed ? 4 : 3);
  } catch (error) {
    handleWebAuthnError(error);
  } finally {
    isGetting.value = false;
  }
}

function clearLocalPasskey() {
  localStorage.removeItem("qauth-demo-passkey-raw-id");
  localStorage.removeItem("qauth-demo-passkey-id");
  createResult.value = null;
  getResult.value = null;
  webauthnStatus.value = "Ready";
  webauthnError.value = "";
}

function handleWebAuthnError(error: unknown) {
  const name = error instanceof DOMException || error instanceof Error ? error.name : "Error";
  webauthnStatus.value = name === "NotAllowedError" || name === "AbortError" ? "Canceled" : "Failed";
  const zh = props.lang === "zh";
  const messages: Record<string, string> = {
    NotAllowedError: zh ? "用户取消了 Passkey 操作，或认证请求已超时。" : "The passkey request was canceled or timed out.",
    InvalidStateError: zh ? "此设备上可能已经存在同一演示凭据。请清除本地演示记录后重试。" : "A matching demo credential may already exist on this device. Clear the local demo record and try again.",
    SecurityError: zh ? "请检查 HTTPS、RP ID、Origin 或 iframe 环境是否符合 WebAuthn 要求。" : "Check HTTPS, RP ID, Origin, or iframe constraints for WebAuthn.",
    NotSupportedError: zh ? "当前浏览器或平台不支持此 Passkey 操作。" : "This browser or platform does not support this passkey operation.",
    AbortError: zh ? "Passkey 操作已中止。" : "The passkey operation was aborted.",
  };
  webauthnError.value = messages[name] ?? (zh ? "Passkey 操作失败，请稍后重试。" : "The passkey operation failed. Please try again.");
}

function state(value: boolean | null | undefined, trueText = t.value.labels.available, falseText = t.value.labels.unavailable) {
  if (value === null || value === undefined) return t.value.labels.unknown;
  return value ? trueText : falseText;
}
</script>

<template>
  <section class="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
    <div class="mb-10 flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl">
        <button class="mb-5 text-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground" type="button" @click="emit('navigate', '/')">{{ t.backHome }}</button>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">QAuth Demo</p>
        <h1 class="mt-4 text-balance text-[clamp(2.5rem,7vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.06em]">{{ t.title }}</h1>
        <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{{ t.subtitle }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" class="rounded-full" @click="prevStep">{{ t.controls.prev }}</Button>
        <Button variant="outline" class="rounded-full" @click="nextStep">{{ t.controls.next }}</Button>
        <Button class="rounded-full" @click="togglePlayback"><Pause v-if="isPlaying" :size="16" /><Play v-else :size="16" />{{ isPlaying ? t.controls.pause : t.controls.play }}</Button>
        <Button variant="ghost" class="rounded-full" @click="resetDemo"><RotateCcw :size="16" />{{ t.controls.reset }}</Button>
      </div>
    </div>

    <div class="mb-6 overflow-x-auto pb-1">
      <div class="inline-flex min-w-max rounded-full border border-border bg-card/70 p-1 shadow-sm">
        <button v-for="mode in modes" :key="mode.id" type="button" class="rounded-full px-4 py-2 text-sm font-medium transition duration-300" :class="activeMode === mode.id ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'" @click="selectMode(mode.id)">{{ mode.label }}</button>
      </div>
    </div>

    <Card class="overflow-hidden rounded-[2rem] border-border bg-card/80 p-4 sm:p-6">
      <div class="grid min-w-0 gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <aside class="min-w-0 rounded-3xl border border-border bg-background/65 p-5">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0"><p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Step {{ activeStep + 1 }}</p><h2 class="mt-3 text-2xl font-semibold tracking-[-0.04em]">{{ currentStep.title }}</h2></div>
            <span class="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary"><Check v-if="isComplete" :size="18" /><Circle v-else :size="14" /></span>
          </div>
          <p class="mt-4 text-sm leading-6 text-muted-foreground">{{ currentStep.description }}</p>
          <div class="mt-6 h-1.5 overflow-hidden rounded-full bg-secondary"><div class="h-full rounded-full bg-foreground transition-all duration-300" :style="{ width: `${progress}%` }" /></div>
          <p class="mt-4 truncate text-sm font-medium" :title="currentStep.status">{{ currentStep.status }}</p>
        </aside>

        <div class="min-w-0">
          <Transition name="qauth-demo-fade" mode="out-in">
            <div v-if="activeMode === 'webauthn'" key="webauthn" class="grid min-w-0 gap-4">
              <div class="rounded-3xl border border-border bg-background/65 p-4 sm:p-5">
                <div class="flex items-center justify-between gap-3"><h3 class="font-semibold">{{ t.webauthn.env }}</h3><Fingerprint class="text-muted-foreground" :size="20" /></div>
                <div class="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div class="min-w-0"><p class="text-muted-foreground">{{ t.labels.secure }}</p><p class="truncate font-medium">{{ state(env?.isSecureContext, t.labels.available, t.labels.required) }}</p></div>
                  <div class="min-w-0"><p class="text-muted-foreground">{{ t.labels.api }}</p><p class="truncate font-medium">{{ state(env?.hasPublicKeyCredential && env?.hasCredentialsApi) }}</p></div>
                  <div class="min-w-0"><p class="text-muted-foreground">{{ t.labels.platform }}</p><p class="truncate font-medium">{{ state(env?.platformAuthenticator) }}</p></div>
                  <div class="min-w-0"><p class="text-muted-foreground">{{ t.labels.top }}</p><p class="truncate font-medium">{{ state(env?.isTopLevelContext, t.labels.yes, t.labels.no) }}</p></div>
                  <div class="min-w-0"><p class="text-muted-foreground">{{ t.labels.rp }}</p><p class="truncate font-mono" :title="env?.rpId">{{ env?.rpId }}</p></div>
                  <div class="min-w-0"><p class="text-muted-foreground">{{ t.labels.origin }}</p><p class="truncate font-mono" :title="env?.origin">{{ env?.origin }}</p></div>
                </div>
                <p v-if="!webauthnAvailable" class="mt-4 rounded-2xl border border-border bg-secondary/60 p-3 text-sm text-muted-foreground">{{ t.unavailable }}</p>
              </div>

              <div class="grid min-w-0 gap-4 md:grid-cols-2">
                <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                  <h3 class="text-lg font-semibold">{{ t.webauthn.create }}</h3><p class="mt-2 text-sm leading-6 text-muted-foreground">{{ t.webauthn.createDesc }}</p>
                  <Button class="mt-4 w-full rounded-full" :disabled="isCreating" @click="createPasskey"><KeyRound :size="16" />{{ isCreating ? 'Prompt Opened' : t.webauthn.create }}</Button>
                  <dl class="mt-4 space-y-2 text-sm">
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Status</dt><dd class="font-medium">{{ webauthnStatus }}</dd></div>
                    <div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 text-muted-foreground">Credential ID</dt><dd class="min-w-0 truncate font-mono" :title="createResult?.id">{{ createResult?.id ?? '—' }}</dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Client Data Type</dt><dd class="font-medium">{{ createResult?.clientDataJSON.type ?? '—' }}</dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Challenge Match</dt><dd class="font-medium">{{ createResult ? state(createResult.check.challenge, t.labels.passed, t.labels.failed) : '—' }}</dd></div>
                  </dl>
                </div>

                <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                  <h3 class="text-lg font-semibold">{{ t.webauthn.get }}</h3><p class="mt-2 text-sm leading-6 text-muted-foreground">{{ t.webauthn.getDesc }}</p>
                  <Button class="mt-4 w-full rounded-full" :disabled="isGetting" @click="usePasskey"><Fingerprint :size="16" />{{ isGetting ? 'Authenticator Prompt' : t.webauthn.get }}</Button>
                  <dl class="mt-4 space-y-2 text-sm">
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Status</dt><dd class="font-medium">{{ getResult ? 'Demo Sign-in Complete' : 'Waiting for Credential' }}</dd></div>
                    <div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 text-muted-foreground">Credential ID</dt><dd class="min-w-0 truncate font-mono" :title="getResult?.id">{{ getResult?.id ?? '—' }}</dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Signature Returned</dt><dd class="font-medium">{{ getResult?.signature ? t.labels.yes : '—' }}</dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-muted-foreground">User Verified</dt><dd class="font-medium">{{ getResult ? state(getResult.userVerified, t.labels.yes, t.labels.no) : '—' }}</dd></div>
                  </dl>
                </div>
              </div>
              <p v-if="webauthnError" class="rounded-2xl border border-border bg-secondary/70 p-3 text-sm text-muted-foreground">{{ webauthnError }}</p>
              <div class="rounded-3xl border border-border bg-background/65 p-4 text-sm text-muted-foreground"><p>{{ t.productionNote }}</p><Button variant="ghost" class="mt-3 rounded-full" @click="clearLocalPasskey">{{ t.webauthn.clear }}</Button></div>
            </div>

            <div v-else key="flow" class="grid min-w-0 gap-4 md:grid-cols-2">
              <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <div class="flex items-center justify-between gap-3"><h3 class="text-lg font-semibold">桌面端发起登录</h3><Laptop class="text-muted-foreground" :size="20" /></div>
                <div class="mt-4 rounded-2xl border border-border bg-background p-4">
                  <p class="text-sm font-semibold">QAuth Login</p><p class="mt-1 text-sm text-muted-foreground">Scan with Trusted Device</p>
                  <div class="mt-4 max-w-[136px] rounded-2xl bg-white p-2"><RealQrCode :value="session.payload" /></div>
                  <dl class="mt-4 space-y-2 text-sm"><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Session ID</dt><dd class="font-mono">qa_7K92M4</dd></div><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Expires in</dt><dd>02:58</dd></div><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Status</dt><dd class="font-medium">Waiting for Approval</dd></div></dl>
                </div>
              </div>

              <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <div class="flex items-center justify-between gap-3"><h3 class="text-lg font-semibold">手机端确认请求</h3><Smartphone class="text-muted-foreground" :size="20" /></div>
                <div class="mt-4 rounded-2xl border border-border bg-background p-4">
                  <p class="text-sm font-semibold">Confirm Sign-in</p><dl class="mt-4 space-y-2 text-sm"><div class="flex justify-between gap-3"><dt class="text-muted-foreground">App</dt><dd>QAuth Workspace</dd></div><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Browser</dt><dd>Chrome</dd></div><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Device</dt><dd>iPhone</dd></div><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Location</dt><dd>Shanghai CN</dd></div></dl>
                  <div class="mt-4 grid grid-cols-2 gap-2"><button class="rounded-full bg-foreground px-3 py-2 text-sm font-medium text-background">Approve</button><button class="rounded-full border border-border px-3 py-2 text-sm font-medium text-muted-foreground">Deny</button></div>
                </div>
              </div>

              <div class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <div class="flex items-center justify-between gap-3"><h3 class="text-lg font-semibold">识别可信设备</h3><ShieldCheck class="text-muted-foreground" :size="20" /></div>
                <dl class="mt-5 space-y-3 text-sm"><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Device</dt><dd>iPhone 15 Pro</dd></div><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Trust</dt><dd>Trusted Device</dd></div><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Last Verified</dt><dd>2 min ago</dd></div><div class="flex min-w-0 justify-between gap-3"><dt class="shrink-0 text-muted-foreground">Browser Binding</dt><dd class="min-w-0 truncate font-mono" :title="session.browserBinding">{{ shortBinding }}</dd></div><div class="flex justify-between gap-3"><dt class="text-muted-foreground">Device Status</dt><dd>Verified</dd></div></dl>
              </div>

              <div v-if="activeMode === 'proof'" class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <h3 class="text-lg font-semibold">计算挑战</h3><p class="mt-2 text-sm text-muted-foreground">浏览器完成轻量工作量证明后继续认证，用于降低自动化请求风险。</p>
                <div class="mt-4 space-y-3 text-sm"><div class="rounded-2xl border border-border bg-background p-3"><p class="font-medium">Challenge Card</p><p class="mt-2 text-muted-foreground">Difficulty: 0000 Prefix · Expires In: 02:58 · Status: Active</p></div><div class="rounded-2xl border border-border bg-background p-3"><p class="font-medium">Searching Nonce</p><p class="mt-2 text-muted-foreground">Attempts: {{ proofAttempts.toLocaleString() }} · Current Hash: 8f9a…03be</p><div class="mt-3 h-1.5 rounded-full bg-secondary"><div class="h-full rounded-full bg-foreground transition-all" :style="{ width: `${Math.min(100, activeStep * 26)}%` }" /></div></div><div class="rounded-2xl border border-border bg-background p-3"><p class="font-medium">Proof Found</p><p class="mt-2 text-muted-foreground">Nonce: 482910 · Verification: Passed · Continue Authentication</p></div></div>
              </div>

              <div v-else class="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <div class="flex min-w-0 items-center gap-4"><span class="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary"><Check :size="18" /></span><div class="min-w-0"><h3 class="truncate text-lg font-semibold">Session Verified</h3><p class="mt-1 truncate text-sm text-muted-foreground">Approved on Trusted Device</p></div></div>
                <div class="mt-4 flex flex-wrap items-center gap-2 text-sm"><span class="rounded-full border border-border px-3 py-1 text-muted-foreground">Verification Complete</span><span class="rounded-full bg-foreground px-3 py-1 font-medium text-background">Continue to Workspace</span></div>
              </div>
            </div>
          </Transition>

          <ol class="mt-6 grid gap-2 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-5">
            <li v-for="(step, index) in currentSteps" :key="step.id" class="min-w-0 rounded-2xl border p-3 transition duration-300 ease-out" :class="index === activeStep ? 'border-foreground/20 bg-card text-foreground' : index < activeStep ? 'border-border bg-secondary/60 text-foreground' : 'border-border bg-transparent text-muted-foreground opacity-70'">
              <div class="mb-2 flex items-center gap-2"><Check v-if="index < activeStep" :size="14" /><Circle v-else :size="12" /><span class="text-xs font-medium">{{ index + 1 }}</span></div><p class="truncate text-sm font-medium" :title="step.status">{{ step.status }}</p>
            </li>
          </ol>
        </div>
      </div>
    </Card>

    <div class="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-5">
      <button class="flex w-full items-center justify-between gap-4 text-left" type="button" @click="showDetails = !showDetails"><span class="font-medium">{{ showDetails ? t.details.hide : t.details.view }}</span><ChevronDown :class="['shrink-0 transition duration-200', showDetails ? 'rotate-180' : '']" :size="18" /></button>
      <Transition name="qauth-details">
        <div v-if="showDetails" class="mt-5 grid gap-3 border-t border-border pt-5 text-sm md:grid-cols-2 lg:grid-cols-5">
          <div class="min-w-0"><p class="text-muted-foreground">Session ID</p><p class="mt-1 truncate font-mono" :title="session.id">{{ session.id }}</p></div>
          <div class="min-w-0"><p class="text-muted-foreground">Challenge ID</p><p class="mt-1 truncate font-mono">{{ createResult?.challengeBase64URL ?? 'ch_62f9a8c1' }}</p></div>
          <div class="min-w-0"><p class="text-muted-foreground">Credential ID</p><p class="mt-1 truncate font-mono" :title="createResult?.id">{{ createResult?.id ?? '—' }}</p></div>
          <div class="min-w-0"><p class="text-muted-foreground">Origin Match</p><p class="mt-1 font-medium">{{ createResult ? state(createResult.check.origin, t.labels.passed, t.labels.failed) : '—' }}</p></div>
          <div class="min-w-0"><p class="text-muted-foreground">Assertion Status</p><p class="mt-1 truncate font-medium">{{ getResult ? 'Signature Returned' : webauthnStatus }}</p></div>
        </div>
      </Transition>
    </div>
  </section>
</template>
