"use client";

import { useRef, useEffect } from "react";
import { Message, Scenario } from "@/types";
import { ChatBubble } from "./ChatBubble";

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl shadow-xl">
          🌙
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">
          Hi! I&apos;m Luna, your English tutor
        </h2>
        <p className="mb-6 max-w-sm text-sm text-slate-400">
          Practice speaking English in a safe, encouraging space. I&apos;ll correct your grammar
          gently, introduce new vocabulary, and keep the conversation flowing.
        </p>

        <div className="mb-8 grid w-full max-w-sm grid-cols-2 gap-2">
          {[
            { icon: "🎙️", text: "Speak with your mic" },
            { icon: "⌨️", text: "Or type a message" },
            { icon: "✏️", text: "Get gentle corrections" },
            { icon: "📚", text: "Learn new vocabulary" },
          ].map((item) => (
            <div
              key={item.text}
              className="glass flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-300"
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenScenarios}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-indigo-500 active:scale-95"
        >
          🎭 Choose a scenario to start
        </button>
        <p className="mt-3 text-xs text-slate-500">
          Or just start typing below for free conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 md:px-6">
      {currentScenario?.id && (
        <div className="flex justify-center">
          <span className="rounded-full bg-indigo-600/20 px-3 py-1 text-xs text-indigo-400 ring-1 ring-indigo-500/30">
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
