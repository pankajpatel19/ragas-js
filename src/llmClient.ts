import { OpenAI } from "openai/client";
import type { LLMconfig } from "./types.js";

export async function LLM(config: LLMconfig, prompt: string): Promise<string> {
  const client = new OpenAI({
    apiKey: config.apiKey,
  });
  const res = await client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  });
  return (
    res.choices[0]?.message?.content?.toString() ??
    Promise.reject("No response from LLM")
  );
}
