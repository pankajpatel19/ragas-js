import { OpenAI } from "openai/client";
import type { LLMconfig } from "./types.js";

export async function LLMCall(
  config: LLMconfig,
  prompt: string,
): Promise<string> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
  const res = await client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: config.model ?? "gpt-4o-mini",
    temperature: config.temperature ?? 0.0,
    max_tokens: config.maxTokens ?? 1000,
  });

  return (
    res.choices[0]?.message?.content?.toString() ??
    Promise.reject("No response from LLM")
  );
}
