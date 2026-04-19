"use client";

import { Settings } from "@/types";
import { useTheme, useLang } from "@/lib/context";
import type { Lang } from "@/lib/i18n";

interface HeaderProps {
  settings: Settings;
  onOpenSettings: () => void;
  onOpenScenarios: () => void;
  onNewSession: () => void;
}

const LEVEL_BADGE: Record<string, string> = {
  beginner: "text-emerald-600 bg-emerald-400/10 dark:text-emerald-400",
  intermediate: "text-amber-600 bg-amber-400/10 dark:text-amber-400",
  advanced: "text-rose-600 bg-rose-400/10 dark:text-rose-400",
};

const LANGS: Lang[] = ["en", "ru", "kz", "zh"];

export function Header({ settings, onOpenSettings, onOpenScenarios, onNewSession }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();

  return (
    <header className="glass sticky top-0 z-20 flex items-center justify-between gap-2 px-4 py-3 md:px-6">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold shadow-lg text-white">
          L
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          LinguaLabs<span className="text-indigo-500 dark:text-indigo-400">AI</span>
        </span>
        <span
          className={`ml-0.5 hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block ${LEVEL_BADGE[settings.level]}`}
        >
          {settings.level.charAt(0).toUpperCase() + settings.level.slice(1)}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? t.lightTheme : t.darkTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-black/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Language switcher */}
        <div className="flex items-center rounded-lg bg-black/5 p-0.5 dark:bg-white/5">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-md px-1.5 py-1 text-[11px] font-medium uppercase transition ${
                lang === l
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        {(
          [
            { key: "scenarios" as const, icon: "🎭", onClick: onOpenScenarios, titleKey: "chooseScenario" as const },
            { key: "newSession" as const, icon: "🔄", onClick: onNewSession, titleKey: "newConversation" as const },
            { key: "settings" as const, icon: "⚙️", onClick: onOpenSettings, titleKey: "settings" as const },
          ]
        ).map((btn) => (
          <button
            key={btn.key}
            onClick={btn.onClick}
            title={t[btn.titleKey]}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 transition hover:bg-black/5 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <span>{btn.icon}</span>
            <span className="hidden sm:inline">{t[btn.key]}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
