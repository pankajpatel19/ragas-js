export interface LLMconfig{
    provider : "openai",
    model : string,
    apiKey : string,
    temperature : number,
    maxTokens : number,
}