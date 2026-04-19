"use client";

import { Settings, Level, SpeechRate } from "@/types";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

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
            <SegmentedControl
              options={["beginner", "intermediate", "advanced"] as Level[]}
              value={settings.level}
              onChange={(v) => set("level", v)}
            />
            <p className="mt-1.5 text-[10px] text-slate-500">
              {settings.level === "beginner" && "Simple vocabulary, short sentences"}
              {settings.level === "intermediate" && "Everyday vocabulary, common idioms"}
              {settings.level === "advanced" && "Rich vocabulary, complex expressions"}
            </p>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-400">
              TTS Playback Speed
            </label>
            <SegmentedControl
              options={["slow", "normal", "fast"] as SpeechRate[]}
              value={settings.speechRate}
              onChange={(v) => set("speechRate", v)}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <Toggle
              label="Auto-play responses"
              description="Automatically read Luna's replies aloud"
              checked={settings.autoPlay}
              onChange={(v) => set("autoPlay", v)}
            />
            <Toggle
              label="Phonetic hints"
              description="Show IPA pronunciation for new vocabulary"
              checked={settings.showPhonetics}
              onChange={(v) => set("showPhonetics", v)}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-[0.99]"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-1 rounded-xl bg-white/4 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-lg py-2 text-xs font-medium transition ${
            value === opt ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}

function Toggle({
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
