import { z } from "zod";
import type { LLMconfig } from "../types";
import { LLMCall } from "../llmClient.js";

const statementSchema = z.object({
  statements: z.array(z.string()),
});

const verdictSchema = z.object({
  verdicts: z.array(
    z.object({
      statement: z.string(),
      supported: z.boolean(),
    }),
  ),
});
export async function faithfulness(
  input: {
    question: string;
    answer: string;
    context: string[];
  },
  llm: LLMconfig,
) {
  const extractionPrompt = `Given a question and an answer, break the answer into short, atomic factual statements. Return ONLY valid JSON: {"statements": ["...", "..."]}.

Question: ${input.question}
Answer: ${input.answer}`;

  const rawStatements = await LLMCall(llm, extractionPrompt);
  const parsed = statementSchema.safeParse(
    JSON.parse(cleanJSON(rawStatements)),
  );

  const verdictPrompt = `Given a context and a list of statements, judge for each statement whether it is directly supported by the context. Return ONLY valid JSON: {"verdicts": [{"statement": "...", "supported": true}]}.

Context:
${input.context.join("\n")}

Statements:
${parsed.success ? parsed.data.statements.map((s, i) => `${i + 1}. ${s}`).join("\n") : ""}`;

  const verdict = await LLMCall(llm, verdictPrompt);
  const parsedVerdict = verdictSchema.safeParse(JSON.parse(cleanJSON(verdict)));

  const supportedCount = parsedVerdict.success
    ? parsedVerdict.data.verdicts.filter((v) => v.supported).length
    : 0;

  const score =
    parsedVerdict.success && parsedVerdict.data.verdicts.length > 0
      ? supportedCount / parsedVerdict.data.verdicts.length
      : 0;

  return {
    score,
    statements: parsedVerdict.success ? parsedVerdict.data.verdicts : [],
  };
}

function cleanJSON(raw: string): string {
  return raw.replace(/```json|```/g, "").trim();
}
