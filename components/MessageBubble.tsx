"use client";

import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

export function MessageBubble({ message, onSpeak, isSpeaking }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { tutorData } = message;

  const timeStr = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex animate-slide-up gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
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

      <div className={`flex max-w-[75%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        {/* Main bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-indigo-600 text-white"
              : "glass rounded-tl-sm text-slate-100"
          }`}
        >
          <p>{isUser ? message.content : tutorData?.message ?? message.content}</p>
        </div>

        {/* Corrections */}
        {!isUser && tutorData && tutorData.corrections.length > 0 && (
          <div className="w-full rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-xs">
            <p className="mb-2 flex items-center gap-1.5 font-semibold text-amber-400">
              <span>✏️</span> Grammar Note
            </p>
            {tutorData.corrections.map((c, i) => (
              <div key={i} className="mb-1.5 last:mb-0">
                <span className="line-through text-slate-400">{c.original}</span>
                <span className="mx-1.5 text-slate-500">→</span>
                <span className="font-medium text-amber-300">{c.corrected}</span>
                <p className="mt-0.5 text-slate-400">{c.explanation}</p>
              </div>
            ))}
          </div>
        )}

        {/* Vocabulary */}
        {!isUser && tutorData?.vocabulary && (
          <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 text-xs">
            <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-emerald-400">
              <span>📚</span> New Vocabulary
            </p>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-semibold text-emerald-300">{tutorData.vocabulary.word}</span>
              {tutorData.vocabulary.phonetic && (
                <span className="text-slate-500">{tutorData.vocabulary.phonetic}</span>
              )}
            </div>
            <p className="mt-1 text-slate-300">{tutorData.vocabulary.definition}</p>
            <p className="mt-1 italic text-slate-400">"{tutorData.vocabulary.example}"</p>
          </div>
        )}

        {/* Footer: time + speak button */}
        <div className={`flex items-center gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-slate-600">{timeStr}</span>
          {!isUser && (
            <button
              onClick={() => onSpeak(tutorData?.message ?? message.content)}
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] transition ${
                isSpeaking
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-indigo-400"
              }`}
              title="Read aloud"
            >
              <span>{isSpeaking ? "🔊" : "🔈"}</span>
              {isSpeaking ? "Playing…" : "Listen"}
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
