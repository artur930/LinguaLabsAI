"use client";

import { useEffect, useState } from "react";
import { SessionStats as SessionStatsType } from "@/types";
import { useLang } from "@/lib/context";

interface SessionStatsProps {
  stats: SessionStatsType;
}

export function SessionStats({ stats }: SessionStatsProps) {
  const [elapsed, setElapsed] = useState("0:00");
  const { t } = useLang();

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - stats.startTime.getTime()) / 1000);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setElapsed(`${m}:${s.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [stats.startTime]);

  return (
    <div className="glass flex items-center justify-center gap-6 rounded-xl px-4 py-2.5">
      <Stat icon="💬" label={t.words} value={stats.wordsSpoken.toString()} />
      <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
      <Stat icon="✏️" label={t.corrections} value={stats.correctionsReceived.toString()} />
      <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
      <Stat icon="⏱️" label={t.time} value={elapsed} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-center">
      <span className="text-sm">{icon}</span>
      <div>
        <p className="text-xs font-semibold leading-none text-slate-900 dark:text-white">{value}</p>
        <p className="text-[10px] leading-none text-slate-400 dark:text-slate-500">{label}</p>
      </div>
    </div>
  );
}
