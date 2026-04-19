"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SpeechRate } from "@/types";

// ─── Web Speech API types (not always in TS lib) ────────────────────────────

export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onresult: ((ev: ISpeechRecognitionEvent) => void) | null;
  onerror: ((ev: ISpeechRecognitionErrorEvent) => void) | null;
}

export interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { readonly transcript: string };
}

export interface ISpeechRecognitionResultList {
  readonly length: number;
  [index: number]: ISpeechRecognitionResult;
}

export interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}

export interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

// ─── Utility helpers ─────────────────────────────────────────────────────────

export function getSpeechRecognitionAPI(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as WindowWithSpeech;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionAPI() !== null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

const RATE_MAP: Record<SpeechRate, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.35,
};

function getPreferredVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-US" && v.name.toLowerCase().includes("google")) ??
    voices.find((v) => v.lang === "en-US") ??
    voices[0]
  );
}

export function speakText(text: string, rate: SpeechRate = "normal"): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = RATE_MAP[rate];
  utterance.pitch = 1.05;
  utterance.volume = 1;
  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}

// ─── useSpeechRecognition hook ───────────────────────────────────────────────

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const isSupported = isSpeechRecognitionSupported();

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }
    const API = getSpeechRecognitionAPI();
    if (!API) return;

    setError(null);
    setTranscript("");
    setInterimTranscript("");

    const recognition = new API();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow access and try again.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else {
        setError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { isListening, transcript, interimTranscript, isSupported, error, startListening, stopListening, resetTranscript };
}

// ─── useSpeechSynthesis hook ──────────────────────────────────────────────────

export interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string, rate?: SpeechRate) => void;
  cancel: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = isSpeechSynthesisSupported();

  const cancel = useCallback(() => {
    cancelSpeech();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, rate: SpeechRate = "normal") => {
      if (!isSupported) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = RATE_MAP[rate];
      utterance.pitch = 1.05;
      utterance.volume = 1;
      const voice = getPreferredVoice();
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  // Trigger re-render when voices load asynchronously
  useEffect(() => {
    if (!isSupported) return;
    const noop = () => {};
    window.speechSynthesis.addEventListener("voiceschanged", noop);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", noop);
  }, [isSupported]);

  useEffect(() => () => { if (isSupported) window.speechSynthesis.cancel(); }, [isSupported]);

  return { isSpeaking, isSupported, speak, cancel };
}
