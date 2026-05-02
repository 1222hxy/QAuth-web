"use client";

import { useEffect, useState } from "react";
import { PreferenceControls } from "./components/preference-controls";

const copy = {
  zh: {
    demo: "体验 Demo",
    badge: "Device-first Authentication Engine",
    subtitle: "产品背后的无密码认证引擎",
    desc: "让你的产品支持 Passkey、扫码确认、设备绑定和高风险二次验证。用户看到的是你的品牌，认证系统由 QAuth 负责。",
    cta1: "体验登录演示",
    cta2: "查看接入设计",
    capabilities: "核心能力",
    flow: "典型流程",
    flowText:
      "电脑创建会话 → 手机扫码确认 → Passkey 批准 → 服务端验证绑定关系 → 原浏览器自动登录。",
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
    demo: "Open Demo",
    badge: "Device-first Authentication Engine",
    subtitle: "Passwordless authentication engine behind your product",
    desc: "Enable passkeys, QR approval, device binding, and high-risk step-up verification while keeping your own product brand front and center.",
    cta1: "Try Login Demo",
    cta2: "View Integration Design",
    capabilities: "Core Capabilities",
    flow: "Typical Flow",
    flowText:
      "Desktop creates session → phone scans and approves → passkey verifies → server checks binding → original browser receives session.",
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

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-200/60 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-black/20";

export default function HomePage() {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "zh";
    const saved = window.localStorage.getItem("qauth-lang");
    return saved === "en" ? "en" : "zh";
  });

  useEffect(() => {
    window.localStorage.setItem("qauth-lang", lang);
  }, [lang]);

  const t = copy[lang];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_45%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_32%),linear-gradient(180deg,#020617_0%,#0b1120_45%,#020617_100%)]" />

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-tight">QAuth</div>
          <div className="flex items-center gap-3">
            <PreferenceControls lang={lang} setLang={setLang} />
            <a href="/demo" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
              {t.demo}
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t.badge}</p>
        <h1 className="mt-2 text-[clamp(56px,8vw,108px)] leading-[0.95] tracking-[-0.06em] font-bold">QAuth</h1>
        <h2 className="mt-3 max-w-3xl text-2xl font-semibold text-slate-800 md:text-3xl dark:text-slate-100">{t.subtitle}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">{t.desc}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/demo" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">{t.cta1}</a>
          <a href="/docs" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">{t.cta2}</a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h3 className="text-2xl font-semibold">{t.capabilities}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">{capabilities[lang].map((item) => <div key={item} className={cardClass}>{item}</div>)}</div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h3 className="text-2xl font-semibold">{t.flow}</h3>
        <p className="mt-3 rounded-2xl border border-slate-200/80 bg-white/90 p-5 leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">{t.flowText}</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h3 className="text-2xl font-semibold">{t.demoDocs}</h3>
        <p className="mt-3 text-slate-600 dark:text-slate-300">{t.demoText}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {[ ["/demo", t.toDemo], ["/docs", t.toDocs], ["/security", t.toSecurity], ["/roadmap", t.toRoadmap] ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">{label}</a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h3 className="text-2xl font-semibold">{t.roadmap}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[[t.now, roadmap.now], [t.building, roadmap.building], [t.next, roadmap.next]].map(([title, items]) => (
            <div key={title} className={cardClass}>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {items.map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
