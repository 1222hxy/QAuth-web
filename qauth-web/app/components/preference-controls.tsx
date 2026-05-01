"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function PreferenceControls({ lang, setLang }: { lang: "zh" | "en"; setLang: (v: "zh" | "en") => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    const startViewTransition = (document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition;
    if (startViewTransition) startViewTransition(() => setTheme(next));
    else setTheme(next);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs text-slate-700 shadow-lg shadow-black/10 backdrop-blur dark:border-white/15 dark:bg-black/40 dark:text-slate-100">
        {lang.toUpperCase()}
      </button>
      <motion.button whileTap={{ scale: 0.92 }} onClick={toggleTheme} className="relative rounded-full border border-black/10 bg-white/70 p-2 text-slate-700 shadow-lg shadow-black/10 backdrop-blur dark:border-white/15 dark:bg-black/40 dark:text-slate-100">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={isDark ? "sun" : "moon"} initial={{ rotate: -90, scale: 0.6, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.6, opacity: 0 }} transition={{ duration: 0.2 }} className="block">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
