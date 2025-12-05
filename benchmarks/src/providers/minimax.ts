/**
 * MiniMax Provider for COON Benchmarks
 * Uses MiniMax M2 via OpenAI-compatible API
 * 
 * Endpoint: https://api.minimax.io/v1/chat/completions
 */

import OpenAI from 'openai';
import type {
    ProviderInterface,
    ChatMessage,
    ChatResponse,
    ChatOptions,
    RateLimitInfo
} from './types.js';

export class MiniMaxProvider implements ProviderInterface {
    readonly name = 'minimax';
    readonly model: string;
    private client: OpenAI | null = null;
    private apiKey: string;

    constructor(model: string = 'MiniMax-M2') {
        this.model = model;
        this.apiKey = process.env.MINIMAX_API_KEY || '';

        if (this.apiKey) {
            this.client = new OpenAI({
                baseURL: process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/v1',
                apiKey: this.apiKey,
            });
        }
    }

    isConfigured(): boolean {
        return !!this.apiKey && !!this.client;
    }

    getRateLimitInfo(): RateLimitInfo {
        // MiniMax rate limits - conservative
        return {
            requestsPerMinute: 10,
            tokensPerMinute: 100000,
        };
    }

    async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
        if (!this.client) {
            const error = 'MiniMax API key not configured. Set MINIMAX_API_KEY in environment.';
            console.error(`\n⚠️  MiniMax Config Error: ${error}`);
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

        try {
            console.log(`\n📤 MiniMax Request to ${this.model}:`);
            console.log(`   Messages: ${messages.length} messages`);
            console.log(`   First message role: ${messages[0]?.role}`);

            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content,
                })),
                temperature: options?.temperature ?? 0.2,
                max_tokens: options?.maxTokens ?? 1024,
                stop: options?.stop,
            });

            const latencyMs = Date.now() - startTime;
            const content = completion.choices[0]?.message?.content || '';
            const usage = completion.usage;

            console.log(`📥 MiniMax Response:`);
            console.log(`   Latency: ${latencyMs}ms`);
            console.log(`   Content length: ${content.length} chars`);
            console.log(`   Content preview: "${content.substring(0, 100)}..."`);
            console.log(`   Input tokens: ${usage?.prompt_tokens ?? 'N/A'}`);
            console.log(`   Output tokens: ${usage?.completion_tokens ?? 'N/A'}`);

            if (!content) {
                console.error(`   ⚠️  EMPTY RESPONSE from MiniMax!`);
                console.error(`   Full completion object:`, JSON.stringify(completion, null, 2));
            }

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

            console.error(`\n⚠️  MiniMax API Error: ${errorMessage}`);
            console.error(`   Model: ${this.model}`);
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
}

// Available MiniMax models
export const MINIMAX_MODELS = [
    {
        id: 'MiniMax-M2',
        name: 'MiniMax M2',
        contextWindow: 128000,
        description: 'MiniMax M2 - coding-focused model via Coding Plan',
        isFree: false,
    },
];
