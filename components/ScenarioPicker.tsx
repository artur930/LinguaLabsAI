"use client";

import { SCENARIOS, Scenario } from "@/types";

interface ScenarioPickerProps {
  currentScenario: Scenario | null;
  onSelect: (scenario: Scenario) => void;
  onClose: () => void;
}

export function ScenarioPicker({ currentScenario, onSelect, onClose }: ScenarioPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass relative z-10 w-full max-w-lg rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">🎭 Practice Scenarios</h2>
            <p className="text-xs text-slate-400">Choose a scenario and start a role-play</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SCENARIOS.map((scenario) => {
            const isActive = currentScenario?.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => { onSelect(scenario); onClose(); }}
                className={`flex flex-col rounded-xl p-3 text-left transition active:scale-[0.98] ${
                  isActive
                    ? "border border-indigo-500/50 bg-indigo-600/20 text-white"
                    : "border border-white/5 bg-white/3 text-slate-300 hover:border-indigo-500/30 hover:bg-indigo-600/10 hover:text-white"
                }`}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-xl">{scenario.icon}</span>
                  <span className="text-sm font-medium leading-tight">{scenario.title}</span>
                  {isActive && <span className="ml-auto text-[10px] text-indigo-400">Active</span>}
                </div>
                <p className="text-xs text-slate-400">{scenario.description}</p>
              </button>
            );
          })}
        </div>

        {/* Free conversation option */}
        <button
          onClick={() => {
            onSelect({ id: "", title: "Free Conversation", icon: "💬", description: "", starterMessage: "" });
            onClose();
          }}
          className="mt-3 w-full rounded-xl border border-white/5 py-2.5 text-sm text-slate-400 transition hover:border-indigo-500/20 hover:text-white active:scale-[0.99]"
        >
          💬 Free Conversation (no scenario)
        </button>
      </div>
    </div>
  );
}
