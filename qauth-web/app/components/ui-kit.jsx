"use client";

import React from "react";

export function Button({ children, className = "", variant = "solid", ...props }) {
  const styles = {
    solid: "bg-sky-600 text-white hover:bg-sky-500",
    outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };
  return <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

export function Card({ children, className = "" }) {
  return <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function Info({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="break-all text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function DemoFrame({ title, subtitle, children }) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
