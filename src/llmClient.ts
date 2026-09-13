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

export async function callEmbedding(llm: LLMconfig, text: string) {
  const client = new OpenAI({
    apiKey: llm.apiKey,
    baseURL: llm.baseURL,
  });
  const res = await client.embeddings.create({
    model: llm.embeddingModel ?? "text-embedding-3-small",
    input: text,
  });

  return res.data[0]?.embedding ?? Promise.reject("No embedding from LLM");
}
