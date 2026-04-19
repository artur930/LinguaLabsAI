"use client";

import { Settings, Level, SpeechRate } from "@/types";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="glass relative z-10 w-full max-w-sm rounded-2xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* Language Level */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
              Language Level
            </label>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-white/4 p-1">
              {(["beginner", "intermediate", "advanced"] as Level[]).map((level) => (
                <button
                  key={level}
                  onClick={() => update("level", level)}
                  className={`rounded-lg py-2 text-xs font-medium transition ${
                    settings.level === level
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-slate-500">
              {settings.level === "beginner" && "Simple vocabulary, short sentences, extra patience"}
              {settings.level === "intermediate" && "Everyday vocabulary, common idioms, natural flow"}
              {settings.level === "advanced" && "Rich vocabulary, idioms, nuanced expressions"}
            </p>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
              Speech Playback Speed
            </label>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-white/4 p-1">
              {(["slow", "normal", "fast"] as SpeechRate[]).map((rate) => (
                <button
                  key={rate}
                  onClick={() => update("speechRate", rate)}
                  className={`rounded-lg py-2 text-xs font-medium transition ${
                    settings.speechRate === rate
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {rate.charAt(0).toUpperCase() + rate.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <ToggleRow
              label="Auto-play AI responses"
              description="Automatically read Luna's responses aloud"
              checked={settings.autoPlay}
              onChange={(v) => update("autoPlay", v)}
            />
            <ToggleRow
              label="Phonetic hints"
              description="Show IPA pronunciation for new vocabulary"
              checked={settings.showPhonetics}
              onChange={(v) => update("showPhonetics", v)}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-200">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
