/**
 * OpenRouter Provider for COON Benchmarks
 * Uses OpenAI-compatible API
 * 
 * Free models: Grok 4.1 Fast, DeepSeek R1T Chimera, GLM 4.5 Air, etc.
 */

import OpenAI from 'openai';
import type {
  ProviderInterface,
  ChatMessage,
  ChatResponse,
  ChatOptions,
  RateLimitInfo
} from './types.js';

export class OpenRouterProvider implements ProviderInterface {
  readonly name = 'openrouter';
  readonly model: string;
  private client: OpenAI | null = null;
  private apiKey: string;

  constructor(model: string = 'x-ai/grok-4-1-fast') {
    this.model = model;
    this.apiKey = process.env.OPENROUTER_API_KEY || '';

    if (this.apiKey) {
      this.client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: this.apiKey,
        defaultHeaders: {
          'HTTP-Referer': 'https://github.com/AffanShaikhsurab/COON',
          'X-Title': 'COON Benchmarks',
        },
      });
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }

  getRateLimitInfo(): RateLimitInfo {
    // OpenRouter free models have generous limits
    return {
      requestsPerMinute: 50,
      tokensPerMinute: 100000,
    };
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.client) {
      return {
        content: '',
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: 0,
        model: this.model,
        error: 'OpenRouter API key not configured',
      };
    }

    const startTime = Date.now();

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.maxTokens ?? 1024,
        stop: options?.stop,
      });

      const latencyMs = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content || '';
      const usage = completion.usage;

      return {
        content,
        inputTokens: usage?.prompt_tokens ?? 0,
        outputTokens: usage?.completion_tokens ?? 0,
        latencyMs,
        model: this.model,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log detailed error for debugging
      if (errorMessage.includes('401') || errorMessage.includes('cookie')) {
        console.error(`\n⚠️  OpenRouter API Error: ${errorMessage}`);
        console.error(`   Model: ${this.model}`);
        console.error(`   Key prefix: ${this.apiKey.substring(0, 15)}...`);
        console.error(`   Hint: Visit https://openrouter.ai to verify your API key is active`);
      }

      return {
        content: '',
        inputTokens: 0,
        outputTokens: 0,
        latencyMs,
        model: this.model,
        error: errorMessage,
      };
    }
  }
}

// Available OpenRouter free models for COON benchmarks
// Updated: December 2025
export const OPENROUTER_MODELS = [
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air (Free)',
    contextWindow: 131072,
    description: 'Z.AI GLM 4.5 Air - lightweight MoE model',
    isFree: true,
  },
  {
    id: 'qwen/qwen3-235b-a22b:free',
    name: 'Qwen3 235B (Free)',
    contextWindow: 131072,
    description: 'Alibaba Qwen3 235B - large reasoning model',
    isFree: true,
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash Exp (Free)',
    contextWindow: 1048576,
    description: 'Google Gemini 2.0 Flash - fast and capable',
    isFree: true,
  },
  {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2 (Free)',
    contextWindow: 131072,
    description: 'Moonshot AI Kimi K2 - strong multilingual model',
    isFree: true,
  },
];
