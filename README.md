# ragas-js

LLM output evaluation metrics for Node.js/TypeScript — a JS-native alternative to [RAGAS](https://github.com/explodinggradients/ragas), for teams building RAG/LLM apps in Node instead of Python.

## Why

RAGAS is a popular framework for evaluating LLM/RAG outputs (hallucination checks, relevance scoring, etc.), but it's Python-only. Most Node/React/MERN teams building RAG apps have no equivalent way to evaluate their LLM outputs without spinning up a separate Python service.

`ragas-js` brings the same idea — using an LLM as a judge to score another LLM's output — natively to Node/TypeScript.

## Install

\`\`\`bash
npm install ragas-js
\`\`\`

## Usage

\`\`\`ts
import { faithfulness } from "ragas-js";

const result = await faithfulness(
{
question: "What is the capital of France?",
answer: "Paris is the capital of France.",
context: ["Paris is the capital and most populous city of France."],
},
{
provider: "openai",
apiKey: process.env.OPENAI_API_KEY!,
}
);

console.log(result);
// { score: 1, statements: [{ statement: "...", supported: true }] }
\`\`\`

## Using other OpenAI-compatible providers

Since many providers (Groq, OpenRouter, etc.) expose an OpenAI-compatible API, you can point `ragas-js` at them with `baseURL` — no separate integration needed:

\`\`\`ts
const result = await faithfulness(input, {
provider: "openai",
apiKey: process.env.GROQ_API_KEY!,
baseURL: "https://api.groq.com/openai/v1",
model: "llama-3.3-70b-versatile",
});
\`\`\`

This is useful for testing without an OpenAI billing setup.

### `answerRelevancy`

Measures how well an answer addresses the original question — independent of whether it's factually correct. Useful for catching off-topic or evasive answers.

\`\`\`ts
import { answerRelevancy } from "ragas-js";

const result = await answerRelevancy(
{
question: "What is the capital of France?",
answer: "Paris is the capital of France.",
},
{
provider: "openai",
apiKey: process.env.OPENAI_API_KEY!,
}
);

console.log(result);
// { score: 0.94, generatedQuestions: ["What is France's capital?", ...] }
\`\`\`

**How it works:** the LLM reverse-engineers 3 candidate questions the answer could be responding to, then each is compared to the original question via embedding cosine similarity. Score is the average similarity (0 to 1).

**⚠️ Requires a real embeddings-capable provider.** Unlike `faithfulness`, this metric calls an embeddings endpoint. Free chat-only providers like Groq don't support embeddings — use OpenAI directly for this metric.

### `contextPrecision`

Measures how well the retrieved context chunks are ranked by relevance — are the most useful chunks near the top, or buried among irrelevant ones? Useful for evaluating retrieval quality, not just the final answer.

\`\`\`ts
import { contextPrecision } from "ragas-js";

const result = await contextPrecision(
{
question: "What is the capital of France?",
answer: "Paris is the capital of France.",
context: [
"Paris is the capital and most populous city of France.",
"France is a country in Western Europe.",
],
},
{
provider: "openai",
apiKey: process.env.OPENAI_API_KEY!,
}
);

console.log(result);
// { score: 1, verdicts: [{ context: "...", relevant: true }, ...] }
\`\`\`

**How it works:** the LLM judges each context chunk as relevant or not (in the order given), then computes position-weighted average precision — relevant chunks ranked earlier score higher than the same chunks ranked later. Works with any OpenAI-compatible chat provider (no embeddings needed, so Groq works fine here).

### `contextRecall`

Measures how much of a known-correct reference answer (ground truth) is actually covered by the retrieved context. Useful for catching incomplete retrieval — cases where the context is missing information needed for a complete answer.

\`\`\`ts
import { contextRecall } from "ragas-js";

const result = await contextRecall(
{
question: "How tall is Mount Everest and where is it located?",
context: ["Mount Everest is 8,849 meters tall."],
groundTruth:
"Mount Everest is 8,849 meters tall and is located in the Himalayas, on the border of Nepal and China.",
},
{
provider: "openai",
apiKey: process.env.OPENAI_API_KEY!,
}
);

console.log(result);
// { score: 0.5, statements: [{ statement: "...", attributed: true }, { statement: "...", attributed: false }] }
\`\`\`

**How it works:** the LLM breaks the ground truth answer into atomic statements, then checks each one against the retrieved context. Score is the fraction of ground-truth statements the context actually covers (0 to 1). Unlike the other metrics, this one requires a `groundTruth` (reference answer) instead of the AI's generated `answer`. Works with any OpenAI-compatible chat provider — no embeddings needed.

## Config options

| Option           | Required | Default                   | Notes                                                                          |
| ---------------- | -------- | ------------------------- | ------------------------------------------------------------------------------ |
| `apiKey`         | ✅       | —                         | Your provider API key                                                          |
| `provider`       | ✅       | —                         | Currently only `"openai"` (works with any OpenAI-compatible API via `baseURL`) |
| `model`          | ❌       | `gpt-4o-mini`             | Any chat-completion model your provider supports                               |
| `baseURL`        | ❌       | OpenAI's default endpoint | Override to use a different OpenAI-compatible provider                         |
| `temperature`    | ❌       | `0`                       | Lower = more consistent scoring                                                |
| `embeddingModel` | ❌       | text-embedding-3-small    | Used by `answerRelevancy` only                                                 |
| `maxTokens`      | ❌       | `1000`                    | Max tokens per LLM call                                                        |

## What it does

`faithfulness` measures how much of an answer is actually supported by the given context. It works in two LLM calls:

1. Breaks the answer down into atomic factual statements
2. Checks each statement against the context and marks it supported or not

The score is the fraction of statements that were supported (0 to 1).

## Current scope (v0.2)

- ✅ One metric: `faithfulness`
- ✅ Works with OpenAI and any OpenAI-compatible provider (Groq, OpenRouter, etc.)
- ✅ `answerRelevancy` metric
- ✅ `contextPrecision` metric
- ✅ `contextRecall` metric
- ❌ No other metrics yet (answerRelevancy, contextPrecision, contextRecall)
- ❌ No CLI, no dashboard, no persistence

## Roadmap

- [ ] CLI for running evals against a JSON/CSV dataset

## License

MIT — see [LICENSE](./LICENSE).
