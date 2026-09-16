import dotenv from "dotenv";
dotenv.config();
import fs from "fs/promises";
import path from "path";
import { contextPrecision, faithfulness } from "../src";

const sampleData = process.argv[2];
const sampleDataPath = sampleData
  ? path.resolve(sampleData)
  : "./sample-data.json";

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY is required. Set it in your environment or .env file.",
  );
}

const loadSampleData = async () => {
  try {
    const data = await fs.readFile(sampleDataPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading sample data:", error);
    throw error;
  }
};

const lodedData = await loadSampleData();

for (const item of lodedData) {
  const faithRes = await contextPrecision(item, {
    provider: "openai",
    model,
    apiKey,
    temperature: 0.0,
    maxTokens: 1000,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });
  console.log(faithRes);
}
