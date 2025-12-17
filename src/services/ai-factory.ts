import type { AIProvider, AIProviderType } from "./ai-provider.js";
import { AnthropicProvider } from "./anthropic-provider.js";
import { OpenAIProvider } from "./openai-provider.js";

export interface AIProviderConfig {
  provider: AIProviderType;
  apiKey?: string;
  model?: string;
}

export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case "anthropic":
      return new AnthropicProvider(config.apiKey, config.model);
    case "openai":
      return new OpenAIProvider(config.apiKey, config.model);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

export function getDefaultProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER as AIProviderType) || "anthropic";
  return createAIProvider({ provider });
}
