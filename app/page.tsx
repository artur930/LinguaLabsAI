"use client";

import { useState, useCallback, useRef } from "react";
import {
  Message,
  Settings,
  DEFAULT_SETTINGS,
  Scenario,
  SessionStats,
  StreamEvent,
  TutorMeta,
} from "@/types";
import { useSpeechSynthesis } from "@/lib/speechUtils";
import { countWords } from "@/lib/speechUtils";
import { Header } from "@/components/Header";
import { ConversationView } from "@/components/ConversationView";
import { MicButton } from "@/components/MicButton";
import { ScenarioPicker } from "@/components/ScenarioPicker";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SessionStats as SessionStatsWidget } from "@/components/SessionStats";

let nextId = 1;
function uid() {
  return `msg-${nextId++}-${Date.now()}`;
}

function makeMessage(
  role: "user" | "assistant",
  content: string,
  meta?: TutorMeta,
  streaming = false
): Message {
  return { id: uid(), role, content, meta, streaming, timestamp: new Date() };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showScenarios, setShowScenarios] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    wordsSpoken: 0,
    correctionsReceived: 0,
    startTime: new Date(),
  });

  const { speak, isSpeaking } = useSpeechSynthesis();
  const streamingIdRef = useRef<string | null>(null);

  // ── Send message & consume SSE stream ─────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setTextInput("");
      setIsStreaming(true);

      const userMsg = makeMessage("user", trimmed);
      const assistantMsg = makeMessage("assistant", "", undefined, true);
      streamingIdRef.current = assistantMsg.id;

      const allMessages = [...messages, userMsg];
      setMessages([...allMessages, assistantMsg]);
      setStats((prev) => ({
        ...prev,
        wordsSpoken: prev.wordsSpoken + countWords(trimmed),
      }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            settings,
            scenarioContext: currentScenario?.title,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`Server error: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";
        let collectedText = "";
        let finalMeta: TutorMeta | undefined;

        // Stream reading loop
        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (!payload) continue;

            const event: StreamEvent = JSON.parse(payload);

            if (event.type === "text") {
              collectedText += event.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingIdRef.current
                    ? { ...m, content: collectedText, streaming: true }
                    : m
                )
              );
            } else if (event.type === "meta") {
              finalMeta = {
                corrections: event.corrections,
                vocabulary: event.vocabulary,
              };
            } else if (event.type === "error") {
              throw new Error(event.message);
            } else if (event.type === "done") {
              break outer;
            }
          }
        }

        // Finalise message (remove streaming cursor, attach meta)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingIdRef.current
              ? { ...m, streaming: false, meta: finalMeta }
              : m
          )
        );

        // Update corrections count
        if (finalMeta && finalMeta.corrections.length > 0) {
          setStats((prev) => ({
            ...prev,
            correctionsReceived: prev.correctionsReceived + finalMeta!.corrections.length,
          }));
        }

        // Auto-play TTS
        if (settings.autoPlay && collectedText) {
          speak(collectedText, settings.speechRate);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        // Remove the empty streaming message
        setMessages((prev) => prev.filter((m) => m.id !== streamingIdRef.current));
      } finally {
        setIsStreaming(false);
        streamingIdRef.current = null;
      }
    },
    [isStreaming, messages, settings, currentScenario, speak]
  );

  // ── Scenario selection ──────────────────────────────────────────────────────

  const handleSelectScenario = useCallback(
    (scenario: Scenario) => {
      setCurrentScenario(scenario);
      setMessages([]);
      setStats({ wordsSpoken: 0, correctionsReceived: 0, startTime: new Date() });
      setError(null);

      if (scenario.starterMessage) {
        const starter = makeMessage("assistant", scenario.starterMessage, {
          corrections: [],
          vocabulary: null,
        });
        setMessages([starter]);
        if (settings.autoPlay) speak(scenario.starterMessage, settings.speechRate);
      }
    },
    [settings.autoPlay, settings.speechRate, speak]
  );

  const handleNewSession = useCallback(() => {
    setMessages([]);
    setCurrentScenario(null);
    setStats({ wordsSpoken: 0, correctionsReceived: 0, startTime: new Date() });
    setError(null);
  }, []);

  // ── Key handler for text area ───────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(textInput);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        settings={settings}
        onOpenSettings={() => setShowSettings(true)}
        onOpenScenarios={() => setShowScenarios(true)}
        onNewSession={handleNewSession}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Conversation */}
        <ConversationView
          messages={messages}
          currentScenario={currentScenario}
          onSpeak={(text) => speak(text, settings.speechRate)}
          isSpeaking={isSpeaking}
          onOpenScenarios={() => setShowScenarios(true)}
        />

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/20">
            <span>⚠️</span>
            <div className="flex-1">
              <p className="font-medium">Oops, something went wrong</p>
              <p className="text-xs text-red-400/80">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">
              ✕
            </button>
          </div>
        )}

        {/* Input bar */}
        <div className="mx-4 mb-2 md:mx-6">
          <div className="glass flex items-end gap-3 rounded-2xl p-3 md:p-4">
            {/* Mic button */}
            <MicButton
              onTranscriptReady={(text) => {
                setTextInput((prev) => (prev ? prev + " " + text : text));
              }}
              disabled={isStreaming}
            />

            {/* Text area */}
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
              rows={1}
              disabled={isStreaming}
              className="min-h-[44px] flex-1 resize-none rounded-xl bg-white/5 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:bg-white/8 focus:ring-1 focus:ring-indigo-500/50 disabled:cursor-not-allowed"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
              }}
            />

            {/* Send */}
            <button
              onClick={() => sendMessage(textInput)}
              disabled={!textInput.trim() || isStreaming}
              title="Send (Enter)"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              {isStreaming ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <span>➤</span>
              )}
            </button>
          </div>
        </div>

        {/* Session stats */}
        <div className="mx-4 mb-4 md:mx-6">
          <SessionStatsWidget stats={stats} />
        </div>
      </main>

      {showScenarios && (
        <ScenarioPicker
          currentScenario={currentScenario}
          onSelect={handleSelectScenario}
          onClose={() => setShowScenarios(false)}
        />
      )}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
