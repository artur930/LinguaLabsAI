"use client";

import { useRef, useEffect } from "react";
import { Message, Scenario } from "@/types";
import { ChatBubble } from "./ChatBubble";
import { useLang } from "@/lib/context";

interface ConversationViewProps {
  messages: Message[];
  currentScenario: Scenario | null;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  onOpenScenarios: () => void;
}

export function ConversationView({
  messages,
  currentScenario,
  onSpeak,
  isSpeaking,
  onOpenScenarios,
}: ConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl shadow-xl">
          🌙
        </div>
        <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
          {t.welcomeTitle}
        </h2>
        <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {t.welcomeDesc}
        </p>

        <div className="mb-8 grid w-full max-w-sm grid-cols-2 gap-2">
          {[
            { icon: "🎙️", key: "featureMic" as const },
            { icon: "⌨️", key: "featureType" as const },
            { icon: "✏️", key: "featureCorrections" as const },
            { icon: "📚", key: "featureVocab" as const },
          ].map((item) => (
            <div
              key={item.key}
              className="glass flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300"
            >
              <span>{item.icon}</span>
              <span>{t[item.key]}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenScenarios}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-indigo-500 active:scale-95"
        >
          {t.chooseScenarioBtn}
        </button>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          {t.freeConvoHint}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 md:px-6">
      {currentScenario?.id && (
        <div className="flex justify-center">
          <span className="rounded-full bg-indigo-600/20 px-3 py-1 text-xs text-indigo-600 ring-1 ring-indigo-500/30 dark:text-indigo-400">
            {currentScenario.icon} {currentScenario.title}
          </span>
        </div>
      )}

      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg}
          onSpeak={onSpeak}
          isSpeaking={isSpeaking}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
