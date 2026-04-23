import { NextRequest } from "next/server";
import { getClient, MODEL } from "@/lib/claude";
import { buildSystemPrompt } from "@/lib/tutorPrompt";
import { Message, Settings, Correction, VocabularyWord } from "@/types";

export async function POST(req: NextRequest) {
          const encoder = new TextEncoder();
          const send = (data: object) =>
                      encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream({
              async start(controller) {
                            try {
                                            const {
                                                              messages,
                                                              settings,
                                                              scenarioContext,
                                            }: { messages: Message[]; settings: Settings; scenarioContext?: string } =
                                                              await req.json();

                              const systemPrompt = buildSystemPrompt(settings, scenarioContext);
                                            const client = getClient();

                              const anthropicMessages = messages.map((m) => ({
                                                role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
                                                content: m.content,
                              }));

                              let fullText = "";
                                            let buffer = "";
                                            let jsonBuffer = "";
                                            type Phase = "seeking_reply" | "in_reply" | "seeking_meta" | "in_meta";
                                            let phase: Phase = "seeking_reply";

                              const REPLY_OPEN = "<REPLY>";
                                            const REPLY_CLOSE = "</REPLY>";
                                            const META_OPEN = "<META>";
                                            const META_CLOSE = "</META>";

                              await client.messages
                                              .stream({
                                                                  model: MODEL,
                                                                  max_tokens: 1024,
                                                                  system: systemPrompt,
                                                                  messages: anthropicMessages,
                                              })
                                              .on("text", (text) => {
                                                                  fullText += text;
                                                                  buffer += text;

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
                                                                                                                      const txt = buffer.slice(0, closeIdx);
                                                                                                                      if (txt) controller.enqueue(send({ type: "text", content: txt }));
                                                                                                                      buffer = buffer.slice(closeIdx + REPLY_CLOSE.length);
                                                                                                                      phase = "seeking_meta";
                                                                                                                      keepGoing = true;
                                                                                                    } else {
                                                                                                                      const safeLen = Math.max(0, buffer.length - REPLY_CLOSE.length);
                                                                                                                      if (safeLen > 0) {
                                                                                                                                                  controller.enqueue(send({ type: "text", content: buffer.slice(0, safeLen) }));
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
                                                                                                    }
                                                                    }

                                                                    if (phase === "in_meta") {
                                                                                            const closeIdx = buffer.indexOf(META_CLOSE);
                                                                                            if (closeIdx !== -1) {
                                                                                                                      jsonBuffer += buffer.slice(0, closeIdx);
                                                                                                                      buffer = "";
                                                                                                                      keepGoing = false;
                                                                                                    } else {
                                                                                                                      jsonBuffer += buffer;
                                                                                                                      buffer = "";
                                                                                                    }
                                                                    }
                                                                  }
                                              })
                                              .finalMessage();

                              let corrections: Correction[] = [];
                                            let vocabulary: VocabularyWord | null = null;
                                            if (jsonBuffer.trim()) {
                                                              try {
                                                                                  const parsed = JSON.parse(jsonBuffer.trim()) as {
                                                                                                        corrections?: Correction[];
                                                                                                        vocabulary?: VocabularyWord | null;
                                                                                          };
                                                                                  corrections = parsed.corrections ?? [];
                                                                                  vocabulary = parsed.vocabulary ?? null;
                                                              } catch { /* ignore */ }
                                            }

                              if (phase === "seeking_reply" && fullText.trim()) {
                                                controller.enqueue(send({ type: "text", content: fullText.trim() }));
                              } else if (phase === "in_reply" && buffer.trim()) {
                                                controller.enqueue(send({ type: "text", content: buffer }));
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
