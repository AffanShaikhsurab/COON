/**
 * Groq Provider for COON Benchmarks
 * Uses groq-sdk
 * 
 * Free models: Kimi K2, GPT-OSS 120B, etc.
 */

import Groq from 'groq-sdk';
import type { 
  ProviderInterface, 
  ChatMessage, 
  ChatResponse, 
  ChatOptions,
  RateLimitInfo 
} from './types.js';

export class GroqProvider implements ProviderInterface {
  readonly name = 'groq';
  readonly model: string;
  private client: Groq | null = null;
  private apiKey: string;

  constructor(model: string = 'moonshotai/kimi-k2-instruct') {
    this.model = model;
    this.apiKey = process.env.GROQ_API_KEY || '';
    
    if (this.apiKey) {
      this.client = new Groq({ apiKey: this.apiKey });
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }

  getRateLimitInfo(): RateLimitInfo {
    // Groq rate limits vary by model
    const limits: Record<string, RateLimitInfo> = {
      'moonshotai/kimi-k2-instruct': { requestsPerMinute: 60, tokensPerMinute: 10000 },
      'moonshotai/kimi-k2-instruct-0905': { requestsPerMinute: 60, tokensPerMinute: 10000 },
      'openai/gpt-oss-120b': { requestsPerMinute: 30, tokensPerMinute: 8000 },
      'openai/gpt-oss-20b': { requestsPerMinute: 30, tokensPerMinute: 8000 },
      'llama-3.3-70b-versatile': { requestsPerMinute: 30, tokensPerMinute: 12000 },
      'qwen/qwen3-32b': { requestsPerMinute: 60, tokensPerMinute: 6000 },
    };
    
    return limits[this.model] || { requestsPerMinute: 30, tokensPerMinute: 6000 };
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.client) {
      return {
        content: '',
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: 0,
        model: this.model,
        error: 'Groq API key not configured',
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
        max_completion_tokens: options?.maxTokens ?? 1024,
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
      if (errorMessage.includes('401') || errorMessage.includes('Invalid API Key')) {
        console.error(`\n⚠️  Groq API Key Error: ${errorMessage}`);
        console.error(`   Model: ${this.model}`);
        console.error(`   Key prefix: ${this.apiKey.substring(0, 10)}...`);
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

// Available Groq models (free tier)
export const GROQ_MODELS = [
  {
    id: 'moonshotai/kimi-k2-instruct',
    name: 'Kimi K2 Instruct',
    contextWindow: 131072,
    description: 'Moonshot AI Kimi K2 - free tier',
    isFree: true,
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    contextWindow: 32768,
    description: 'OpenAI GPT-OSS 120B parameter model',
    isFree: true,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    contextWindow: 32768,
    description: 'OpenAI GPT-OSS 20B parameter model',
    isFree: true,
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    contextWindow: 128000,
    description: 'Meta Llama 3.3 70B',
    isFree: true,
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen3 32B',
    contextWindow: 32768,
    description: 'Alibaba Qwen 3 32B',
    isFree: true,
  },
];
