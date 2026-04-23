import { NextRequest } from "next/server";
import { getClient, MODEL } from "@/lib/claude";
import { buildSystemPrompt } from "@/lib/tutorPrompt";
import { Message, Settings, Correction, VocabularyWord } from "@/types";

const REPLY_OPEN = "<REPLY>";
const REPLY_CLOSE = "</REPLY>";
const META_OPEN = "<META>";
const META_CLOSE = "</META>";

export async function POST(req: NextRequest) {
    const {
          messages,
          settings,
          scenarioContext,
    }: { messages: Message[]; settings: Settings; scenarioContext?: string } =
          await req.json();

  const systemPrompt = buildSystemPrompt(settings, scenarioContext);

  // Build conversation history for Gemini
  const geminiHistory = messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const encoder = new TextEncoder();

  function encodeEvent(data: object): Uint8Array {
        return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
  }

  const stream = new ReadableStream({
        async start(controller) {
                try {
                          const client = getClient();
                          const model = client.getGenerativeModel({
                                      model: MODEL,
                                      systemInstruction: systemPrompt,
                          });

                  const chat = model.startChat({
                              history: geminiHistory,
                  });

                  type Phase = "seeking_reply" | "in_reply" | "seeking_meta" | "in_meta";
                          let phase: Phase = "seeking_reply";
                          let buffer = "";
                          let jsonBuffer = "";

                  const result = await chat.sendMessageStream(lastMessage.content);

                  for await (const chunk of result.stream) {
                              const text = chunk.text();
                              if (!text) continue;

                            buffer += text;

                            // Process accumulated buffer
                            let keepGoing = true;
                              while (keepGoing) {
                                            keepGoing = false;

                                if (phase === "seeking_reply") {
                                                const idx = buffer.indexOf(REPLY_OPEN);
                                                if (idx !== -1) {
                                                                  buffer = buffer.slice(idx + REPLY_OPEN.length);
                                                                  if (buffer.startsWith("\n")) buffer = buffer.slice(1);
                                                                  phase = "in_reply";
                                                                  keepGoing = true;
                                                } else if (buffer.length > REPLY_OPEN.length) {
                                                                  phase = "in_reply";
                                                                  keepGoing = true;
                                                }
                                }

                                if (phase === "in_reply") {
                                                const closeIdx = buffer.indexOf(REPLY_CLOSE);
                                                if (closeIdx !== -1) {
                                                                  const text = buffer.slice(0, closeIdx);
                                                                  if (text) controller.enqueue(encodeEvent({ type: "text", content: text }));
                                                                  buffer = buffer.slice(closeIdx + REPLY_CLOSE.length);
                                                                  phase = "seeking_meta";
                                                                  keepGoing = true;
                                                } else {
                                                                  const safeLen = Math.max(0, buffer.length - REPLY_CLOSE.length);
                                                                  if (safeLen > 0) {
                                                                                      const text = buffer.slice(0, safeLen);
                                                                                      controller.enqueue(encodeEvent({ type: "text", content: text }));
                                                                                      buffer = buffer.slice(safeLen);
                                                                  }
                                                }
                                }

                                if (phase === "seeking_meta") {
                                                const idx = buffer.indexOf(META_OPEN);
                                                if (idx !== -1) {
                                                                  buffer = buffer.slice(idx + META_OPEN.length);
                                                                  if (buffer.startsWith("\n")) buffer = buffer.slice(1);
                                                                  phase = "in_meta";
                                                                  keepGoing = true;
                                                } else if (buffer.length > META_OPEN.length) {
                                                                  keepGoing = false;
                                                }
                                }

                                if (phase === "in_meta") {
                                                const closeIdx = buffer.indexOf(META_CLOSE);
                                                if (closeIdx !== -1) {
                                                                  jsonBuffer += buffer.slice(0, closeIdx);
                                                                  try {
                                                                                      const parsed = JSON.parse(jsonBuffer.trim()) as {
                                                                                                            corrections?: Correction[];
                                                                                                            vocabulary?: VocabularyWord | null;
                                                                                        };
                                                                                      controller.enqueue(
                                                                                                            encodeEvent({
                                                                                                                                    type: "meta",
                                                                                                                                    corrections: parsed.corrections ?? [],
                                                                                                                                    vocabulary: parsed.vocabulary ?? null,
                                                                                                              })
                                                                                                          );
                                                                  } catch {
                                                                                      controller.enqueue(
                                                                                                            encodeEvent({ type: "meta", corrections: [], vocabulary: null })
                                                                                                          );
                                                                  }
                                                                  buffer = "";
                                                                  keepGoing = false;
                                                } else {
                                                                  jsonBuffer += buffer;
                                                                  buffer = "";
                                                }
                                }
                              }
                  }

                  // Flush any remaining reply text (fallback)
                  if (phase === "in_reply" && buffer.trim()) {
                              controller.enqueue(encodeEvent({ type: "text", content: buffer }));
                  }

                  if (phase !== "in_meta") {
                              controller.enqueue(encodeEvent({ type: "meta", corrections: [], vocabulary: null }));
                  }

                  controller.enqueue(encodeEvent({ type: "done" }));
                          controller.close();
                } catch (err) {
                          const message = err instanceof Error ? err.message : "Unknown error";
                          console.error("[/api/chat]", message);
                          controller.enqueue(
                                      encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`)
                                    );
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
