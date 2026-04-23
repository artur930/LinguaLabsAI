import { GoogleGenerativeAI } from "@google/generative-ai";

// Singleton Gemini client — constructed once per server process
let _client: GoogleGenerativeAI | null = null;

export function getClient(): GoogleGenerativeAI {
      if (!_client) {
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                        throw new Error("GEMINI_API_KEY environment variable is not set");
              }
              _client = new GoogleGenerativeAI(apiKey);
      }
      return _client;
}

// gemini-1.5-flash has higher free-tier limits than gemini-2.0-flash
export const MODEL = "gemini-1.5-flash" as const;
