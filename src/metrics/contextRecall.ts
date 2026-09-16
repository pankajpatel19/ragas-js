import z from "zod";
import type { ContextRecallResult, LLMconfig } from "../types";
import { LLMCall } from "../llmClient";
import { cleanJSON } from "./faithfulness";

const statementSchema = z.object({
  statement: z.array(z.string()),
});

const attributeSchema = z.object({
  verdict: z.array(
    z.object({
      statement: z.string(),
      attributed: z.boolean(),
    }),
  ),
});
export async function contextRecall(
  input: {
    question: string;
    context: string[];
    groundTruth: string;
  },
  llm: LLMconfig,
): Promise<ContextRecallResult> {
  const extractionPrompt = `Given a question and a reference (ground truth) answer, break the reference answer down into a list of short, atomic factual statements. Return ONLY valid JSON in this shape: {"statements": ["...", "..."]}.

Question: ${input.question}
Reference answer: ${input.groundTruth}`;

  const statements = await LLMCall(llm, extractionPrompt);
  const parsedStatements = statementSchema.parse(
    JSON.parse(cleanJSON(statements)),
  );

  const attributionPrompt = `Given a context and a list of statements, judge for each statement whether it can be attributed to (is supported/covered by) the context. Return ONLY valid JSON in this shape: {"verdicts": [{"statement": "...", "attributed": true}]}.

Context:
${input.context.join("\n")}

Statements:
${parsedStatements.statement.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;

  const verdicts = await LLMCall(llm, attributionPrompt);
  const parsedVerdicts = attributeSchema.parse(JSON.parse(cleanJSON(verdicts)));

  const attributedCount = parsedVerdicts.verdict.filter(
    (v) => v.attributed,
  ).length;

  const score =
    parsedStatements.statement.length > 0
      ? attributedCount / parsedStatements.statement.length
      : 0;
  return { score, statements: parsedVerdicts.verdict };
}
