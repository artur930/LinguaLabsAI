"use client";

import { Settings } from "@/types";

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenScenarios: () => void;
  onNewSession: () => void;
  settings: Settings;
}

export function Header({ onOpenSettings, onOpenScenarios, onNewSession, settings }: HeaderProps) {
  const levelColors: Record<string, string> = {
    beginner: "text-emerald-400 bg-emerald-400/10",
    intermediate: "text-amber-400 bg-amber-400/10",
    advanced: "text-rose-400 bg-rose-400/10",
  };

  return (
    <header className="glass sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:px-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold shadow-lg">
          L
        </div>
        <div>
          <span className="text-base font-semibold tracking-tight text-white">
            LinguaLabs
          </span>
          <span className="text-base font-semibold tracking-tight text-indigo-400">AI</span>
        </div>
        <span
          className={`ml-1 hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block ${levelColors[settings.level]}`}
        >
          {settings.level.charAt(0).toUpperCase() + settings.level.slice(1)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenScenarios}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          title="Choose a scenario"
        >
          <span className="text-base">🎭</span>
          <span className="hidden sm:inline">Scenarios</span>
        </button>
        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          title="New conversation"
        >
          <span className="text-base">🔄</span>
          <span className="hidden sm:inline">New</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          title="Settings"
        >
          <span className="text-base">⚙️</span>
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
}
