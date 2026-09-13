export interface LLMconfig {
  provider?: "openai";
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string; // Optional base URL for the API/
  embeddingModel?: string; // Optional embedding model for the API
}

export interface AnswerRelevancyResult {
  score: number;
  generatedQuestions: string[];
}
