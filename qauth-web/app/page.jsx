"use client";

import { useEffect, useState } from "react";
import { PreferenceControls } from "./components/preference-controls";

const copy = {
  zh: {
    nav: ["能力", "流程", "安全", "路线图"],
    demo: "体验 Demo",
    badge: "Device-first Authentication Engine",
    subtitle: "产品背后的无密码认证引擎",
    desc: "让你的产品支持 Passkey、扫码确认、设备绑定和高风险二次验证。用户看到的是你的品牌，认证系统由 QAuth 负责。",
    cta1: "体验登录演示",
    cta2: "查看接入设计",
    capabilities: "核心能力",
    flow: "典型流程",
    flowText: "电脑创建会话 → 手机扫码确认 → Passkey 批准 → 服务端验证绑定关系 → 原浏览器自动登录。",
    security: "安全设计",
    developer: "开发者接入示例",
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
  },
  en: {
    nav: ["Capabilities", "Flow", "Security", "Roadmap"],
    demo: "Open Demo",
    badge: "Device-first Authentication Engine",
    subtitle: "Passwordless authentication engine behind your product",
    desc: "Enable passkeys, QR approval, device binding, and high-risk step-up verification while keeping your own product brand front and center.",
    cta1: "Try Login Demo",
    cta2: "View Integration Design",
    capabilities: "Core Capabilities",
    flow: "Typical Flow",
    flowText: "Desktop creates session → phone scans and approves → passkey verifies → server checks binding → original browser receives session.",
    security: "Security Design",
    developer: "Developer Integration",
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
  },
};
const capabilities = {
  zh: ["Passkey 优先认证", "扫码确认登录", "高风险二次验证"],
  en: ["Passkey-first authentication", "QR approval sign-in", "High-risk step-up verification"],
};
const roadmap = {
  now: ["静态产品页面", "扫码登录交互原型", "Passkey 浏览器调用演示", "计算挑战前端演示", "SSE 状态流演示"],
  building: ["WebAuthn 服务端验证", "扫码会话状态机", "数据库持久化", "设备管理页面"],
  next: ["OAuth / OIDC 接入层", "风险验证策略", "多产品接入控制台", "审计日志"],
};

export default function HomePage() {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "zh";
    const saved = window.localStorage.getItem("qauth-lang");
    return saved === "en" ? "en" : "zh";
  });
  useEffect(() => { window.localStorage.setItem("qauth-lang", lang); }, [lang]);
  const t = copy[lang];
  return <main className="min-h-screen bg-[#f5f7fb] text-slate-900 transition-colors dark:bg-black dark:text-white">{/* same layout simplified */}
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(80,120,255,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(120,80,255,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef2ff_45%,#f5f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(80,120,255,0.25),transparent_35%),radial-gradient(circle_at_top_right,rgba(120,80,255,0.22),transparent_30%),linear-gradient(180deg,#080a12_0%,#0b0f1a_45%,#05060a_100%)]" />
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080a12]/65 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"><div className="text-lg font-semibold">QAuth</div><div className="flex items-center gap-3"><PreferenceControls lang={lang} setLang={setLang} /><a href="/demo" className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm shadow-lg shadow-black/10 dark:border-white/20 dark:bg-white/10">{t.demo}</a></div></div></header>
    <section className="mx-auto max-w-6xl px-6 py-16"><p className="text-xs text-white/70">{t.badge}</p><h1 className="text-[clamp(56px,8vw,112px)] leading-[0.95] tracking-[-0.06em] font-bold">QAuth</h1><h2 className="mt-3 text-3xl">{t.subtitle}</h2><p className="mt-4 max-w-2xl text-white/70">{t.desc}</p></section>
    <section className="mx-auto max-w-6xl px-6 py-12"><h3 className="text-2xl">{t.capabilities}</h3><div className="mt-4 grid gap-4 md:grid-cols-3">{capabilities[lang].map((c)=><div key={c} className="rounded-3xl border border-white/15 bg-white/5 p-5 shadow-lg shadow-black/40 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">{c}</div>)}</div></section>
    <section className="mx-auto max-w-6xl px-6 py-12"><h3 className="text-2xl">{t.flow}</h3><p className="mt-3 text-white/70">{t.flowText}</p></section>
    <section className="mx-auto max-w-6xl px-6 py-12"><h3 className="text-2xl">{t.demoDocs}</h3><p className="mt-3 text-white/70">{t.demoText}</p><div className="mt-4 flex gap-3"><a href="/demo" className="rounded-full border border-white/20 bg-white/10 px-5 py-2 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white/15">{t.toDemo}</a><a href="/docs" className="rounded-full border border-white/20 bg-white/10 px-5 py-2 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white/15">{t.toDocs}</a><a href="/security" className="rounded-full border border-white/20 bg-white/10 px-5 py-2 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white/15">{t.toSecurity}</a><a href="/roadmap" className="rounded-full border border-white/20 bg-white/10 px-5 py-2 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white/15">{t.toRoadmap}</a></div></section>
    <section className="mx-auto max-w-6xl px-6 py-12"><h3 className="text-2xl">{t.roadmap}</h3><div className="mt-4 grid gap-4 md:grid-cols-3">{[[t.now,roadmap.now],[t.building,roadmap.building],[t.next,roadmap.next]].map(([title,items])=><div key={title} className="rounded-3xl border border-white/15 bg-white/5 p-5 shadow-lg shadow-black/40 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"><h4>{title}</h4><ul className="mt-2 text-white/70">{items.map(i=><li key={i}>• {i}</li>)}</ul></div>)}</div></section>
  </main>;
}
