"use client";

import { Settings } from "@/types";

interface HeaderProps {
  settings: Settings;
  onOpenSettings: () => void;
  onOpenScenarios: () => void;
  onNewSession: () => void;
}

const LEVEL_BADGE: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10",
  intermediate: "text-amber-400 bg-amber-400/10",
  advanced: "text-rose-400 bg-rose-400/10",
};

export function Header({ settings, onOpenSettings, onOpenScenarios, onNewSession }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:px-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold shadow-lg text-white">
          L
        </div>
        <span className="text-base font-semibold tracking-tight text-white">
          LinguaLabs<span className="text-indigo-400">AI</span>
        </span>
        <span
          className={`ml-0.5 hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block ${LEVEL_BADGE[settings.level]}`}
        >
          {settings.level.charAt(0).toUpperCase() + settings.level.slice(1)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {(
          [
            { label: "Scenarios", icon: "🎭", onClick: onOpenScenarios, title: "Choose a scenario" },
            { label: "New", icon: "🔄", onClick: onNewSession, title: "Start a new conversation" },
            { label: "Settings", icon: "⚙️", onClick: onOpenSettings, title: "Settings" },
          ] as { label: string; icon: string; onClick: () => void; title: string }[]
        ).map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            title={btn.title}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <span>{btn.icon}</span>
            <span className="hidden sm:inline">{btn.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
