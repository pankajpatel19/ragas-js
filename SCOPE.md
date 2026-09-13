### Scope Freeze — v0.1
## In scope
- One matrix only 
- One metric only: faithfulness
- One LLM provider only: OpenAI (default gpt-4o-mini, model configurable)
- A pure function API: faithfulness(input): Promise<FaithfulnessResult> — no classes, no global state
- Two LLM calls under the hood: (1) break the answer into atomic statements, (2) verify each statement against the provided context
- Validate the LLM's JSON output with Zod (since LLMs occasionally return malformed JSON)
- Unit tests with the LLM call mocked (so tests don't need a real API key)
- Just an npm package — no hosted service

## Out of scope (deliberately deferred):

Other metrics (answerRelevancy, contextPrecision, contextRecall)
Other LLM providers (Anthropic, Gemini)
CLI tool
Web dashboard / React UI
Database / persistence
Auth / login
Billing / Stripe
Multiple languages / i18n