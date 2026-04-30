"use client";

import React, { useState } from "react";
import { Button, Card } from "./components/ui-kit";
import { highlights, navItems } from "./components/site-data";
import { DesktopDemo, MobileCheckDemo, PasskeyDemo } from "./components/demos";

export default function Page() {
  const [tab, setTab] = useState("desktop");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff,#ffffff)] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="text-xl font-bold">QAuth</div>
          <nav className="hidden gap-6 md:flex">
            {navItems.map((item) => <a key={item} href={`#${item}`} className="text-sm text-slate-600 hover:text-slate-900">{item}</a>)}
          </nav>
          <Button>开始集成</Button>
        </div>
      </header>

      <section id="产品" className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
        <div>
          <p className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">Modern Identity Platform</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">更现代的无密码登录体验</h1>
          <p className="mt-4 max-w-2xl text-slate-600">QAuth 提供 Passkey、跨端扫码确认与抗滥用挑战。页面结构与导航已做现代化整理，更接近产品官网风格。</p>
          <div className="mt-6 flex gap-3"><Button>免费试用</Button><Button variant="outline">查看文档</Button></div>
        </div>
        <Card className="p-6">
          <p className="text-sm text-slate-600">核心能力</p>
          <div className="mt-4 space-y-3">
            {highlights.map((h) => <div key={h.title} className="rounded-xl bg-slate-50 p-3"><p className="font-semibold">{h.title}</p><p className="text-sm text-slate-600">{h.desc}</p></div>)}
          </div>
        </Card>
      </section>

      <section id="演示" className="mx-auto max-w-7xl px-5 pb-20">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant={tab === "desktop" ? "solid" : "outline"} onClick={() => setTab("desktop")}>电脑扫码</Button>
          <Button variant={tab === "mobile" ? "solid" : "outline"} onClick={() => setTab("mobile")}>手机确认</Button>
          <Button variant={tab === "passkey" ? "solid" : "outline"} onClick={() => setTab("passkey")}>Passkey 注册</Button>
        </div>
        {tab === "desktop" && <DesktopDemo />}
        {tab === "mobile" && <MobileCheckDemo />}
        {tab === "passkey" && <PasskeyDemo />}
      </section>
    </main>
  );
}
