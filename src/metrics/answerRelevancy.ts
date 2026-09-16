import { callEmbedding, LLMCall } from "../llmClient";
import z from "zod";
import type { AnswerRelevancyResult, LLMconfig } from "../types";
import { cleanJSON } from "./faithfulness";
import { cosineSimilarity } from "../utils/cosineSimilarity";

const questionSchema = z.object({
  questions: z.array(z.string()).min(1).max(3),
});

export async function answerRelevancy(
  input: { question: string; answer: string },
  llmConfig: LLMconfig,
): Promise<AnswerRelevancyResult> {
  // Implementation for answer relevancy metric
  const generationPrompt = `Given an answer, generate 3 questions that this answer could be responding to. Return ONLY valid JSON: {"questions": ["...", "...", "..."]}.

    Answer: ${input.answer}`;

  const rawQuestions = await LLMCall(llmConfig, generationPrompt);
  const parsedQuestions = questionSchema.safeParse(
    JSON.parse(cleanJSON(rawQuestions)),
  );
  const originalEmbedding = await callEmbedding(llmConfig, input.question);

  const generatedEmbeddings = await Promise.all(
    parsedQuestions.success
      ? parsedQuestions.data.questions.map((q) => callEmbedding(llmConfig, q))
      : [],
  );

  const similarityScores = generatedEmbeddings.map((embedding) => {
    return cosineSimilarity(originalEmbedding, embedding);
  });

  const score =
    similarityScores.length > 0
      ? similarityScores.reduce((a, b) => a + b, 0) / similarityScores.length
      : 0;

  return {
    score,
    generatedQuestions: parsedQuestions.data?.questions ?? [],
  };
}
