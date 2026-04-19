"use client";

import { useState, useEffect } from "react";
import { useSpeechRecognition } from "@/lib/speechUtils";
import { WaveformAnimation } from "./WaveformAnimation";
import { useLang } from "@/lib/context";

interface MicButtonProps {
  onTranscriptReady: (text: string) => void;
  disabled?: boolean;
}

export function MicButton({ onTranscriptReady, disabled }: MicButtonProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { t } = useLang();
  const [pendingTranscript, setPendingTranscript] = useState("");

  useEffect(() => {
    if (isListening) {
      setPendingTranscript(transcript + interimTranscript);
    }
  }, [isListening, transcript, interimTranscript]);

  useEffect(() => {
    if (!isListening && transcript) {
      onTranscriptReady(transcript);
      resetTranscript();
      setPendingTranscript("");
    }
  }, [isListening, transcript, onTranscriptReady, resetTranscript]);

  if (!isSupported) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      {isListening && (
        <div className="flex w-full flex-col items-center gap-1.5 rounded-xl bg-indigo-500/10 px-4 py-2.5 ring-1 ring-indigo-500/30">
          <WaveformAnimation isActive={isListening} />
          {pendingTranscript ? (
            <p className="text-center text-xs text-indigo-700 dark:text-indigo-200">{pendingTranscript}</p>
          ) : (
            <p className="animate-pulse text-xs text-indigo-500/70 dark:text-indigo-400/60">{t.listening}</p>
          )}
        </div>
      )}

      {error && (
        <p className="text-center text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      <button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        title={isListening ? t.stopRecordingTap : t.startSpeaking}
        aria-label={isListening ? t.stopRecording : t.startSpeaking}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-xl shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 md:h-16 md:w-16 ${
          isListening
            ? "mic-pulse bg-indigo-600 text-white ring-4 ring-indigo-500/30"
            : "bg-black/[0.08] text-slate-500 hover:bg-indigo-600/25 hover:text-indigo-600 hover:ring-2 hover:ring-indigo-500/40 dark:bg-white/8 dark:text-slate-400 dark:hover:text-indigo-300"
        }`}
      >
        {isListening ? "⏹" : "🎙️"}
      </button>
    </div>
  );
}
