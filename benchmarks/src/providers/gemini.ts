/**
 * Gemini Provider for COON Benchmarks
 * Uses @google/genai SDK
 */

import { GoogleGenAI } from '@google/genai';
import type {
  ProviderInterface,
  ChatMessage,
  ChatResponse,
  ChatOptions,
  RateLimitInfo
} from './types.js';

export class GeminiProvider implements ProviderInterface {
  readonly name = 'gemini';
  readonly model: string;
  private client: GoogleGenAI | null = null;
  private apiKey: string;

  constructor(model: string = 'gemini-2.0-flash') {
    this.model = model;
    this.apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }

  getRateLimitInfo(): RateLimitInfo {
    // Gemini free tier limits
    return {
      requestsPerMinute: 15,
      tokensPerMinute: 1000000, // 1M tokens/min for flash
    };
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is a rate limit (429) error
   */
  private isRateLimitError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      return (error as { status: number }).status === 429;
    }
    if (error instanceof Error) {
      return error.message.includes('429') ||
        error.message.includes('RESOURCE_EXHAUSTED') ||
        error.message.includes('quota');
    }
    return false;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.client) {
      const error = 'Gemini API key not configured';
      console.error(`\n⚠️  Gemini Config Error: ${error}`);
      return {
        content: '',
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: 0,
        model: this.model,
        error,
      };
    }

    const startTime = Date.now();

    // Retry configuration
    const MAX_RETRIES = 5;
    const INITIAL_DELAY_MS = 60000; // 1 minute initial delay for 429
    const MAX_DELAY_MS = 600000; // 10 minutes max delay

    let lastError: unknown = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Convert messages to Gemini format
        const systemInstruction = messages.find(m => m.role === 'system')?.content;
        const contents = messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          }));

        console.log(`\n📤 Gemini Request to ${this.model}${attempt > 0 ? ` (Retry ${attempt}/${MAX_RETRIES})` : ''}:`);
        console.log(`   Messages: ${contents.length} messages`);
        console.log(`   System instruction: ${systemInstruction ? 'Yes' : 'No'}`);

        const response = await this.client.models.generateContent({
          model: this.model,
          contents,
          config: {
            systemInstruction,
            temperature: options?.temperature ?? 0.1,
            maxOutputTokens: options?.maxTokens ?? 1024,
            stopSequences: options?.stop,
          },
        });

        const latencyMs = Date.now() - startTime;
        const text = response.text || '';

        // Extract token usage from response metadata
        const usageMetadata = response.usageMetadata;

        console.log(`📥 Gemini Response:`);
        console.log(`   Latency: ${latencyMs}ms`);
        console.log(`   Content length: ${text.length} chars`);
        console.log(`   Content preview: "${text.substring(0, 100)}..."`);
        console.log(`   Input tokens: ${usageMetadata?.promptTokenCount ?? 'N/A'}`);
        console.log(`   Output tokens: ${usageMetadata?.candidatesTokenCount ?? 'N/A'}`);

        if (!text) {
          console.error(`   ⚠️  EMPTY RESPONSE from Gemini!`);
          console.error(`   Full response object:`, JSON.stringify(response, null, 2));
        }

        return {
          content: text,
          inputTokens: usageMetadata?.promptTokenCount ?? 0,
          outputTokens: usageMetadata?.candidatesTokenCount ?? 0,
          latencyMs,
          model: this.model,
        };
      } catch (error) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Check if this is a rate limit error
        if (this.isRateLimitError(error) && attempt < MAX_RETRIES) {
          // Calculate delay with exponential backoff: 60s, 120s, 240s, 480s, 960s (capped at 10 min)
          const baseDelay = INITIAL_DELAY_MS * Math.pow(2, attempt);
          // Add jitter (0-10% of delay) to prevent thundering herd
          const jitter = Math.random() * 0.1 * baseDelay;
          const delay = Math.min(baseDelay + jitter, MAX_DELAY_MS);

          console.warn(`\n⏳ Rate limit (429) hit. Waiting ${Math.round(delay / 1000)}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
          console.warn(`   Error: ${errorMessage}`);

          await this.sleep(delay);
          continue;
        }

        // Log the error for non-retryable errors or after all retries exhausted
        const latencyMs = Date.now() - startTime;
        console.error(`\n⚠️  Gemini API Error: ${errorMessage}`);
        console.error(`   Model: ${this.model}`);
        console.error(`   Attempts: ${attempt + 1}`);
        console.error(`   Full error:`, error);

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

    // This shouldn't be reached, but just in case
    const latencyMs = Date.now() - startTime;
    const errorMessage = lastError instanceof Error ? lastError.message : 'Max retries exceeded';
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

// Available Gemini models
export const GEMINI_MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    contextWindow: 1048576,
    description: 'Most balanced model with 1M context window',
    isFree: true,
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    contextWindow: 1048576,
    description: 'Fastest and most cost-efficient model',
    isFree: true,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    contextWindow: 1048576,
    description: 'Previous generation flash model',
    isFree: true,
  },
];
