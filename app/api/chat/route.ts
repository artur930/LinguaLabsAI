import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/tutorPrompt";
import { Message, Settings, Correction, VocabularyWord } from "@/types";

// Models to try in order (fallback chain)
const MODELS = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
      ];

interface GeminiResponse {
        candidates?: Array<{
                  content?: {
                              parts?: Array<{ text?: string }>;
                  };
        }>;
        error?: { message: string; code: number };
}

async function callGemini(
        apiKey: string,
        model: string,
        systemPrompt: string,
        messages: Message[]
      ): Promise<string> {
        // Build contents array for Gemini REST API
  const contents = messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
  }));

  // Ensure starts with user role
  while (contents.length > 0 && contents[0].role !== "user") {
            contents.shift();
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                        system_instruction: { parts: [{ text: systemPrompt }] },
                        contents,
                        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
  });

  const data: GeminiResponse = await res.json();

  if (!res.ok || data.error) {
            const msg = data.error?.message ?? `HTTP ${res.status}`;
            // Throw with status so caller can decide to retry
          const err = new Error(msg) as Error & { status?: number };
            err.status = data.error?.code ?? res.status;
            throw err;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty response from Gemini");
        return text;
}

function parseReply(raw: string): { reply: string; corrections: Correction[]; vocabulary: VocabularyWord | null } {
        // Try to parse structured XML response first
  const replyMatch = raw.match(/<REPLY>([\s\S]*?)<\/REPLY>/);
        const metaMatch = raw.match(/<META>([\s\S]*?)<\/META>/);

  let reply = replyMatch ? replyMatch[1].trim() : raw.trim();
        let corrections: Correction[] = [];
        let vocabulary: VocabularyWord | null = null;

  if (metaMatch) {
            try {
                        const meta = JSON.parse(metaMatch[1].trim());
                        corrections = meta.corrections ?? [];
                        vocabulary = meta.vocabulary ?? null;
            } catch {
                        // ignore parse errors
            }
  }

  return { reply, corrections, vocabulary };
}

export async function POST(req: NextRequest) {
        const encoder = new TextEncoder();

  const send = (data: object) =>
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream({
            async start(controller) {
                        try {
                                      const { messages, settings, scenarioContext }: {
                                                      messages: Message[];
                                                      settings: Settings;
                                                      scenarioContext?: string;
                                      } = await req.json();

                          const apiKey = process.env.GEMINI_API_KEY;
                                      if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

                          const systemPrompt = buildSystemPrompt(settings, scenarioContext);

                          let rawText: string | null = null;
                                      let lastError: Error | null = null;

                          // Try each model in order until one works
                          for (const model of MODELS) {
                                          try {
                                                            rawText = await callGemini(apiKey, model, systemPrompt, messages);
                                                            break;
                                          } catch (err) {
                                                            lastError = err as Error;
                                                            const status = (err as Error & { status?: number }).status;
                                                            // Only retry on quota/rate errors (429) or model not found (404)
                                            if (status === 429 || status === 404) {
                                                                console.warn(`[/api/chat] model ${model} failed (${status}), trying next`);
                                                                continue;
                                            }
                                                            throw err;
                                          }
                          }

                          if (rawText === null) {
                                          throw lastError ?? new Error("All models failed");
                          }

                          const { reply, corrections, vocabulary } = parseReply(rawText);

                          // Stream the reply word by word for a typing effect
                          const words = reply.split(" ");
                                      for (let i = 0; i < words.length; i++) {
                                                      const chunk = (i === 0 ? "" : " ") + words[i];
                                                      controller.enqueue(send({ type: "text", content: chunk }));
                                      }

                          controller.enqueue(send({ type: "meta", corrections, vocabulary }));
                                      controller.enqueue(send({ type: "done" }));
                                      controller.close();
                        } catch (err) {
                                      const message = err instanceof Error ? err.message : "Unknown error";
                                      console.error("[/api/chat]", message);
                                      controller.enqueue(send({ type: "error", message }));
                                      controller.close();
                        }
            },
  });

  return new Response(stream, {
            headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        Connection: "keep-alive",
            },
  });
}
