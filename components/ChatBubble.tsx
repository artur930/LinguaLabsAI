"use client";

import { Message } from "@/types";
import { useLang } from "@/lib/context";

interface ChatBubbleProps {
  message: Message;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

export function ChatBubble({ message, onSpeak, isSpeaking }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const { t } = useLang();

  const timeStr = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex animate-slide-up gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
        }`}
      >
        {isUser ? "👤" : "🌙"}
      </div>

      <div
        className={`flex max-w-[76%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-indigo-600 text-white"
              : "glass rounded-tl-sm text-slate-800 dark:text-slate-100"
          }`}
        >
          {message.streaming ? (
            <>
              <span>{message.content}</span>
              <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-indigo-400 align-middle" />
            </>
          ) : (
            <span>{message.content}</span>
          )}
        </div>

        {/* Grammar corrections */}
        {!isUser && message.meta && message.meta.corrections.length > 0 && (
          <div className="w-full rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-xs">
            <p className="mb-2 flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
              <span>✏️</span> {t.grammarNote}
            </p>
            {message.meta.corrections.map((c, i) => (
              <div key={i} className="mb-1.5 last:mb-0">
                <span className="line-through text-slate-500 dark:text-slate-400">{c.original}</span>
                <span className="mx-1.5 text-slate-400 dark:text-slate-500">→</span>
                <span className="font-medium text-amber-700 dark:text-amber-300">{c.corrected}</span>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">{c.explanation}</p>
              </div>
            ))}
          </div>
        )}

        {/* Vocabulary */}
        {!isUser && message.meta?.vocabulary && (
          <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 text-xs">
            <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <span>📚</span> {t.newVocab}
            </p>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                {message.meta.vocabulary.word}
              </span>
              {message.meta.vocabulary.phonetic && (
                <span className="text-slate-500 dark:text-slate-500">{message.meta.vocabulary.phonetic}</span>
              )}
            </div>
            <p className="mt-1 text-slate-700 dark:text-slate-300">{message.meta.vocabulary.definition}</p>
            <p className="mt-1 italic text-slate-500 dark:text-slate-400">"{message.meta.vocabulary.example}"</p>
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-slate-400 dark:text-slate-600">{timeStr}</span>
          {!isUser && !message.streaming && (
            <button
              onClick={() => onSpeak(message.content)}
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] transition ${
                isSpeaking ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400"
              }`}
              title={t.readAloud}
            >
              <span>{isSpeaking ? "🔊" : "🔈"}</span>
              {isSpeaking ? t.playing : t.listen}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex animate-fade-in gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm text-white">
        🌙
      </div>
      <div className="glass flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}
