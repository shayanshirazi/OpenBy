import type { OpenRouterModel } from "@/lib/openrouter";

export const PRODUCT_QA_MODELS = {
  openai: "openai/gpt-4o" as OpenRouterModel,
  gemini: "google/gemini-2.0-flash-001" as OpenRouterModel,
  claude: "anthropic/claude-3.5-sonnet" as OpenRouterModel,
} as const;

export type ProductQAModelKey = keyof typeof PRODUCT_QA_MODELS;

export const PRODUCT_QA_MODEL_LABELS: Record<ProductQAModelKey, string> = {
  openai: "OpenAI (GPT-4o)",
  gemini: "Gemini",
  claude: "Claude",
};

export const PRODUCT_QA_MODEL_LOGOS: Record<ProductQAModelKey, string> = {
  openai: "/openai-logo.png",
  gemini: "/gemini-logo.png",
  claude: "/claude-logo.png",
};
