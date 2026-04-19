"use client";

import { SCENARIOS, Scenario } from "@/types";
import { useLang } from "@/lib/context";
import type { Translations } from "@/lib/i18n";

interface ScenarioPickerProps {
  currentScenario: Scenario | null;
  onSelect: (scenario: Scenario) => void;
  onClose: () => void;
}

export function ScenarioPicker({ currentScenario, onSelect, onClose }: ScenarioPickerProps) {
  const { t } = useLang();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass relative z-10 w-full max-w-lg rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.practiceScenarios}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.chooseRolePlay}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-black/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SCENARIOS.map((scenario) => {
            const isActive = currentScenario?.id === scenario.id;
            const titleKey = `scenario.${scenario.id}.title` as keyof Translations;
            const descKey = `scenario.${scenario.id}.desc` as keyof Translations;
            const title = (t[titleKey] as string) || scenario.title;
            const desc = (t[descKey] as string) || scenario.description;

            return (
              <button
                key={scenario.id}
                onClick={() => { onSelect(scenario); onClose(); }}
                className={`flex flex-col rounded-xl p-3 text-left transition active:scale-[0.98] ${
                  isActive
                    ? "border border-indigo-500/50 bg-indigo-600/20 text-slate-900 dark:text-white"
                    : "border border-black/5 bg-black/[0.03] text-slate-600 hover:border-indigo-500/30 hover:bg-indigo-600/10 hover:text-slate-900 dark:border-white/5 dark:bg-white/3 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-xl">{scenario.icon}</span>
                  <span className="text-sm font-medium leading-tight">{title}</span>
                  {isActive && (
                    <span className="ml-auto text-[10px] text-indigo-500 dark:text-indigo-400">
                      {t.activeLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            onSelect({ id: "", title: "Free Conversation", icon: "💬", description: "", starterMessage: "" });
            onClose();
          }}
          className="mt-3 w-full rounded-xl border border-black/5 py-2.5 text-sm text-slate-500 transition hover:border-indigo-500/20 hover:text-slate-800 active:scale-[0.99] dark:border-white/5 dark:text-slate-400 dark:hover:text-white"
        >
          {t.freeConvo}
        </button>
      </div>
    </div>
  );
}
