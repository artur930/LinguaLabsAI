"use client";

import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, Settings, DEFAULT_SETTINGS, Scenario, SessionStats, TutorResponse } from "@/types";
import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { VoiceInput } from "@/components/VoiceInput";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SessionStats as SessionStatsWidget } from "@/components/SessionStats";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

function createMessage(
  role: "user" | "assistant",
  content: string,
  tutorData?: TutorResponse
): Message {
  return { id: uuidv4(), role, content, tutorData, timestamp: new Date() };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    wordsSpoken: 0,
    correctionsReceived: 0,
    startTime: new Date(),
  });

  const { speak, isSpeaking } = useSpeechSynthesis();
  const speakingForMsgId = useRef<string | null>(null);

  const handleSpeak = useCallback(
    (text: string) => {
      speak(text, settings.speechRate);
    },
    [speak, settings.speechRate]
  );

  const handleSelectScenario = useCallback(
    (scenario: Scenario) => {
      setCurrentScenario(scenario);
      setMessages([]);
      setStats({ wordsSpoken: 0, correctionsReceived: 0, startTime: new Date() });
      setError(null);

      // Add scenario starter message
      if (scenario.starterMessage) {
        const starterMsg = createMessage("assistant", scenario.starterMessage, {
          message: scenario.starterMessage,
          corrections: [],
          vocabulary: null,
        });
        setMessages([starterMsg]);
        if (settings.autoPlay) {
          speak(scenario.starterMessage, settings.speechRate);
        }
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

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);
      const userMsg = createMessage("user", text);
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      // Count words
      const wordCount = text.trim().split(/\s+/).length;
      setStats((prev) => ({ ...prev, wordsSpoken: prev.wordsSpoken + wordCount }));

      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            settings,
            scenarioContext: currentScenario?.title,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(errData.error ?? `Server error: ${res.status}`);
        }

        const result = await res.json() as { success: boolean; data?: TutorResponse; error?: string };
        if (!result.success || !result.data) {
          throw new Error(result.error ?? "No response from tutor");
        }

        const tutorData: TutorResponse = result.data;
        const assistantMsg = createMessage("assistant", tutorData.message, tutorData);
        setMessages((prev) => [...prev, assistantMsg]);

        // Update corrections count
        if (tutorData.corrections.length > 0) {
          setStats((prev) => ({
            ...prev,
            correctionsReceived: prev.correctionsReceived + tutorData.corrections.length,
          }));
        }

        // Auto-play
        if (settings.autoPlay) {
          speakingForMsgId.current = assistantMsg.id;
          speak(tutorData.message, settings.speechRate);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, settings, currentScenario, speak]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setShowSettings(true)}
        onOpenScenarios={() => setShowScenarios(true)}
        onNewSession={handleNewSession}
      />

      {/* Chat area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          currentScenario={currentScenario}
          onSpeak={handleSpeak}
          isSpeaking={isSpeaking}
          onOpenScenarios={() => setShowScenarios(true)}
        />

        {/* Error banner */}
        {error && (
          <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/20">
            <span className="shrink-0 text-base">⚠️</span>
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="text-xs text-red-400/80">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto shrink-0 text-red-400/60 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        )}

        {/* Voice / text input */}
        <div className="px-4 pb-3 pt-1 md:px-6">
          <VoiceInput
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </div>

        {/* Session stats */}
        <div className="px-4 pb-4 md:px-6">
          <SessionStatsWidget stats={stats} />
        </div>
      </main>

      {/* Modals */}
      {showScenarios && (
        <ScenarioSelector
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
