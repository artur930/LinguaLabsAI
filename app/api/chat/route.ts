import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/prompts";
import { Message, Settings, TutorResponse } from "@/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      settings,
      scenarioContext,
    }: { messages: Message[]; settings: Settings; scenarioContext?: string } =
      await req.json();

    const systemPrompt = buildSystemPrompt(settings, scenarioContext);

    const anthropicMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.role === "assistant" && m.tutorData ? m.tutorData.message : m.content,
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const block = response.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected content type from Claude");
    }

    const raw = block.text.trim();
    // Extract JSON — Claude may occasionally wrap in code fences despite instructions
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }

    const parsed: TutorResponse = JSON.parse(jsonMatch[0]);

    // Normalise corrections field
    if (!Array.isArray(parsed.corrections)) {
      parsed.corrections = [];
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/chat] error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
