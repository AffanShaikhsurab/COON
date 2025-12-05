/**
 * Provider Factory for COON Benchmarks
 */

import { GeminiProvider, GEMINI_MODELS } from './gemini.js';
import { GroqProvider, GROQ_MODELS } from './groq.js';
import { OpenRouterProvider, OPENROUTER_MODELS } from './openrouter.js';
import { ZAIProvider, ZAI_MODELS } from './zai.js';
import { MiniMaxProvider, MINIMAX_MODELS } from './minimax.js';
import type { ProviderInterface, ModelInfo } from './types.js';

export type ProviderType = 'gemini' | 'groq' | 'openrouter' | 'zai' | 'minimax';

export interface ProviderModelConfig {
  provider: ProviderType;
  model: string;
}

/**
 * Create a provider instance
 */
export function createProvider(config: ProviderModelConfig): ProviderInterface {
  switch (config.provider) {
    case 'gemini':
      return new GeminiProvider(config.model);
    case 'groq':
      return new GroqProvider(config.model);
    case 'openrouter':
      return new OpenRouterProvider(config.model);
    case 'zai':
      return new ZAIProvider(config.model);
    case 'minimax':
      return new MiniMaxProvider(config.model);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Get all available models across all providers
 */
export function getAllModels() {
  return [
    ...GEMINI_MODELS.map(m => ({ ...m, provider: 'gemini' as ProviderType })),
    ...GROQ_MODELS.map(m => ({ ...m, provider: 'groq' as ProviderType })),
    ...OPENROUTER_MODELS.map(m => ({ ...m, provider: 'openrouter' as ProviderType })),
    ...ZAI_MODELS.map(m => ({ ...m, provider: 'zai' as ProviderType })),
    ...MINIMAX_MODELS.map(m => ({ ...m, provider: 'minimax' as ProviderType })),
  ];
}

/**
 * Get available providers based on configured API keys
 */
export function getAvailableProviders(): ProviderType[] {
  const available: ProviderType[] = [];

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    available.push('gemini');
  }
  if (process.env.GROQ_API_KEY) {
    available.push('groq');
  }
  if (process.env.OPENROUTER_API_KEY) {
    available.push('openrouter');
  }
  if (process.env.ZAI_API_KEY) {
    available.push('zai');
  }
  if (process.env.MINIMAX_API_KEY) {
    available.push('minimax');
  }

  return available;
}

/**
 * Get default models for benchmarking
 */
export function getDefaultBenchmarkModels(): ProviderModelConfig[] {
  const models: ProviderModelConfig[] = [];

  // Gemini models
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    models.push(
      { provider: 'gemini', model: 'gemini-2.5-flash' },
    );
  }

  // Z.AI GLM 4.6
  if (process.env.ZAI_API_KEY) {
    models.push(
      { provider: 'zai', model: 'glm-4.6' },
    );
  }

  // MiniMax M2
  if (process.env.MINIMAX_API_KEY) {
    models.push(
      { provider: 'minimax', model: 'MiniMax-M2' },
    );
  }

  // Groq models (free tier) - reliable
  if (process.env.GROQ_API_KEY) {
    models.push(
      { provider: 'groq', model: 'llama-3.3-70b-versatile' },
    );
  }

  return models;
}

/**
 * Create providers for all default benchmark models
 */
export function createDefaultProviders(): ProviderInterface[] {
  return getDefaultBenchmarkModels().map(config => createProvider(config));
}
