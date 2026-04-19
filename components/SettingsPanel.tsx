"use client";

import { Settings, Level, SpeechRate } from "@/types";
import { useLang } from "@/lib/context";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value });

  const { t } = useLang();

  const levelLabels: Record<Level, string> = {
    beginner: t.levelBeginner,
    intermediate: t.levelIntermediate,
    advanced: t.levelAdvanced,
  };

  const speedLabels: Record<SpeechRate, string> = {
    slow: t.speedSlow,
    normal: t.speedNormal,
    fast: t.speedFast,
  };

  const levelDesc: Record<Level, string> = {
    beginner: t.levelDescBeginner,
    intermediate: t.levelDescIntermediate,
    advanced: t.levelDescAdvanced,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="glass relative z-10 w-full max-w-sm rounded-2xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.settingsTitle}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-black/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* Language Level */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {t.languageLevel}
            </label>
            <SegmentedControl
              options={["beginner", "intermediate", "advanced"] as Level[]}
              labels={levelLabels}
              value={settings.level}
              onChange={(v) => set("level", v)}
            />
            <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              {levelDesc[settings.level]}
            </p>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {t.ttsSpeed}
            </label>
            <SegmentedControl
              options={["slow", "normal", "fast"] as SpeechRate[]}
              labels={speedLabels}
              value={settings.speechRate}
              onChange={(v) => set("speechRate", v)}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <Toggle
              label={t.autoPlay}
              description={t.autoPlayDesc}
              checked={settings.autoPlay}
              onChange={(v) => set("autoPlay", v)}
            />
            <Toggle
              label={t.phoneticHints}
              description={t.phoneticHintsDesc}
              checked={settings.showPhonetics}
              onChange={(v) => set("showPhonetics", v)}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-[0.99]"
        >
          {t.saveClose}
        </button>
      </div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  labels,
  value,
  onChange,
}: {
  options: T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="grid gap-1 rounded-xl bg-black/[0.04] p-1 dark:bg-white/4"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-lg py-2 text-xs font-medium transition ${
            value === opt
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {labels[opt]}
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
        <p className="text-sm text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-black/10 dark:bg-white/10"
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
