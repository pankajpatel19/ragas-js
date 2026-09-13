export interface LLMconfig {
  provider?: "openai";
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string; // Optional base URL for the API
}
