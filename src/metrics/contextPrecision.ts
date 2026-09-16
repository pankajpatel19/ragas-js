import z from "zod";
import type { ContextPrecisionResult, LLMconfig } from "../types";
import { LLMCall } from "../llmClient";
import { cleanJSON } from "./faithfulness";

const verdictSchema = z.object({
  verdicts: z.array(
    z.object({
      context: z.string(),
      relevant: z.boolean(),
    }),
  ),
});

export async function contextPrecision(
  input: {
    question: string;
    answer: string;
    context: string[];
  },
  llm: LLMconfig,
): Promise<ContextPrecisionResult> {
  const precisionPrompt = `Given a question, an answer, and a list of context chunks, judge for each context chunk whether it was useful/relevant for arriving at the answer. Return ONLY valid JSON in this shape, with one verdict per context chunk IN THE SAME ORDER they were given: {"verdicts": [{"context": "...", "relevant": true}, {"context": "...", "relevant": false}]}.

Question: ${input.question}
Answer: ${input.answer}

Context chunks:
${input.context.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;

  const context = await LLMCall(llm, precisionPrompt);

  const parsedContext = verdictSchema.safeParse(JSON.parse(cleanJSON(context)));

  const precisionScore = AverageContextPrecision(
    parsedContext.success ? parsedContext.data.verdicts : [],
  );
  return {
    score: precisionScore,
    verdicts: parsedContext.success ? parsedContext.data.verdicts : [],
  };
}

function AverageContextPrecision(results: { relevant: boolean }[]): number {
  if (results.length === 0) return 0;
  let relevantCount = 0;
  let precisionSum = 0;

  results.forEach((result, index) => {
    if (result.relevant) {
      relevantCount++;
      precisionSum += relevantCount / (index + 1);
    }
  });

  return relevantCount === 0 ? 0 : precisionSum / relevantCount;
}

export default contextPrecision;
