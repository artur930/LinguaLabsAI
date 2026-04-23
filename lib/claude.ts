import Anthropic from "@anthropic-ai/sdk";

// Singleton Anthropic client
let _client: Anthropic | null = null;

export function getClient(): Anthropic {
          if (!_client) {
                      const apiKey = process.env.ANTHROPIC_API_KEY;
                      if (!apiKey) {
                                    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
                      }
                      _client = new Anthropic({ apiKey });
          }
          return _client;
}

export const MODEL = "claude-haiku-4-5" as const;
