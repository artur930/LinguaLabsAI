"use client";

import { useState, useEffect } from "react";
import { useSpeechRecognition } from "@/lib/speechUtils";
import { WaveformAnimation } from "./WaveformAnimation";

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

  const [pendingTranscript, setPendingTranscript] = useState("");

  // Accumulate interim results so we can show them
  useEffect(() => {
    if (isListening) {
      setPendingTranscript(transcript + interimTranscript);
    }
  }, [isListening, transcript, interimTranscript]);

  // When recording ends, fire callback with final transcript
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
      {/* Waveform + interim transcript preview */}
      {isListening && (
        <div className="flex w-full flex-col items-center gap-1.5 rounded-xl bg-indigo-500/10 px-4 py-2.5 ring-1 ring-indigo-500/30">
          <WaveformAnimation isActive={isListening} />
          {pendingTranscript ? (
            <p className="text-center text-xs text-indigo-200">{pendingTranscript}</p>
          ) : (
            <p className="animate-pulse text-xs text-indigo-400/60">Listening…</p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-center text-xs text-red-400">{error}</p>
      )}

      {/* Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        title={isListening ? "Stop recording (tap again)" : "Start speaking"}
        aria-label={isListening ? "Stop recording" : "Start speaking"}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-xl shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 md:h-16 md:w-16 ${
          isListening
            ? "mic-pulse bg-indigo-600 text-white ring-4 ring-indigo-500/30"
            : "bg-white/8 text-slate-400 hover:bg-indigo-600/25 hover:text-indigo-300 hover:ring-2 hover:ring-indigo-500/40"
        }`}
      >
        {isListening ? "⏹" : "🎙️"}
      </button>
    </div>
  );
}
