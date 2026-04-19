"use client";

import { useState, useEffect } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface VoiceInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function VoiceInput({ onSubmit, isLoading, disabled }: VoiceInputProps) {
  const [textInput, setTextInput] = useState("");
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isSpeechSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // When speech ends, populate text input
  useEffect(() => {
    if (!isListening && transcript) {
      setTextInput(transcript);
      resetTranscript();
    }
  }, [isListening, transcript, resetTranscript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmit = () => {
    const text = textInput.trim();
    if (!text || isLoading) return;
    onSubmit(text);
    setTextInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const displayText = isListening
    ? (transcript + interimTranscript) || ""
    : textInput;

  return (
    <div className="glass rounded-2xl p-3 md:p-4">
      {/* Error banner */}
      {speechError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <span>⚠️</span>
          <span>{speechError}</span>
        </div>
      )}

      {/* Live transcript preview */}
      {isListening && (
        <div className="mb-3 min-h-[36px] rounded-lg bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">
          {displayText || (
            <span className="animate-pulse text-indigo-400/60">Listening…</span>
          )}
        </div>
      )}

      <div className="flex items-end gap-2 md:gap-3">
        {/* Mic button */}
        {isSpeechSupported && (
          <button
            onClick={handleMicClick}
            disabled={isLoading || disabled}
            title={isListening ? "Stop recording" : "Start speaking"}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl transition-all disabled:cursor-not-allowed disabled:opacity-50 md:h-14 md:w-14 ${
              isListening
                ? "mic-pulse bg-indigo-600 text-white"
                : "bg-white/5 text-slate-400 hover:bg-indigo-600/20 hover:text-indigo-400"
            }`}
          >
            {isListening ? "⏹️" : "🎙️"}
          </button>
        )}

        {/* Text input */}
        <textarea
          value={isListening ? displayText : textInput}
          onChange={(e) => {
            if (!isListening) setTextInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? "Listening…"
              : isSpeechSupported
              ? "Tap the mic to speak, or type here…"
              : "Type your message here… (Press Enter to send)"
          }
          rows={1}
          disabled={isListening || isLoading}
          className="min-h-[44px] flex-1 resize-none rounded-xl bg-white/5 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:bg-white/8 focus:ring-1 focus:ring-indigo-500/50 disabled:cursor-not-allowed"
          style={{ maxHeight: "120px" }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = Math.min(t.scrollHeight, 120) + "px";
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!textInput.trim() || isLoading || isListening}
          title="Send (Enter)"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 md:h-12 md:w-12"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <span className="text-base">➤</span>
          )}
        </button>
      </div>

      <p className="mt-2 text-center text-[10px] text-slate-600">
        {isSpeechSupported
          ? "Speak or type • Enter to send • Shift+Enter for new line"
          : "Type your message • Enter to send"}
      </p>
    </div>
  );
}
