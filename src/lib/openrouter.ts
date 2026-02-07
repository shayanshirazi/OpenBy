/**
 * Generic OpenRouter API client for AI model completions.
 * Supports Gemini, Claude, GPT, and other models via OpenRouter.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type OpenRouterModel =
  | "google/gemini-2.0-flash-001"
  | "google/gemini-2.5-pro"
  | "google/gemini-2.5-flash-preview"
  | "google/gemini-pro"
  | "anthropic/claude-3.5-sonnet"
  | "openai/gpt-4o"
  | "openai/gpt-4o-mini"
  | (string & {});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model?: OpenRouterModel;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const DEFAULT_MODEL: OpenRouterModel = "google/gemini-2.0-flash-001";

/**
 * Call an AI model via OpenRouter with a generic prompt.
 * Use this from server actions or API routes.
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  const {
    model = DEFAULT_MODEL,
    messages,
    temperature = 0.7,
    maxTokens = 1024,
    stream = false,
  } = options;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://openby.app",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: { content?: string; role?: string };
      finish_reason?: string;
    }>;
    model?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };

  const content =
    data.choices?.[0]?.message?.content ?? "";

  return {
    content,
    model: data.model ?? String(model),
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}

/**
 * Convenience: generate a response from a single user prompt (optionally with system prompt).
 */
export async function generate(
  userPrompt: string,
  options?: {
    systemPrompt?: string;
    model?: OpenRouterModel;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const messages: ChatMessage[] = [];
  if (options?.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push({ role: "user", content: userPrompt });

  const result = await chatCompletion({
    messages,
    model: options?.model ?? DEFAULT_MODEL,
    temperature: options?.temperature ?? 0.7,
    maxTokens: options?.maxTokens ?? 1024,
  });

  return result.content;
}
