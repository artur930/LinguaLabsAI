"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SpeechRate } from "@/types";

const RATE_MAP: Record<SpeechRate, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.35,
};

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string, rate?: SpeechRate) => void;
  cancel: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const speak = useCallback(
    (text: string, rate: SpeechRate = "normal") => {
      if (!isSupported) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = RATE_MAP[rate];
      utterance.pitch = 1.05;
      utterance.volume = 1;

      // Prefer en-US voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang === "en-US" && v.name.includes("Google")
      ) || voices.find((v) => v.lang === "en-US") || voices[0];

      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  // Voices may load async — force a re-render when they arrive
  useEffect(() => {
    if (!isSupported) return;
    const handleVoicesChanged = () => {};
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  return { isSpeaking, isSupported, speak, cancel };
}
