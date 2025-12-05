/**
 * Z.AI Provider for COON Benchmarks
 * Uses GLM 4.6 via Z.AI Coding Plan API
 * 
 * Endpoint: https://api.z.ai/api/coding/paas/v4/chat/completions
 */

import OpenAI from 'openai';
import type {
    ProviderInterface,
    ChatMessage,
    ChatResponse,
    ChatOptions,
    RateLimitInfo
} from './types.js';

export class ZAIProvider implements ProviderInterface {
    readonly name = 'zai';
    readonly model: string;
    private client: OpenAI | null = null;
    private apiKey: string;

    constructor(model: string = 'glm-4.6') {
        this.model = model;
        this.apiKey = process.env.ZAI_API_KEY || '';

        if (this.apiKey) {
            this.client = new OpenAI({
                baseURL: 'https://api.z.ai/api/coding/paas/v4',
                apiKey: this.apiKey,
                defaultHeaders: {
                    'Accept-Language': 'en-US,en',
                },
            });
        }
    }

    isConfigured(): boolean {
        return !!this.apiKey && !!this.client;
    }

    getRateLimitInfo(): RateLimitInfo {
        // Z.AI Coding Plan limits - conservative to avoid hitting limits
        return {
            requestsPerMinute: 10,
            tokensPerMinute: 100000,
        };
    }

    async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
        if (!this.client) {
            const error = 'Z.AI API key not configured. Set ZAI_API_KEY in environment.';
            console.error(`\n⚠️  Z.AI Config Error: ${error}`);
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
            console.log(`\n📤 Z.AI Request to ${this.model}:`);
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

            console.log(`📥 Z.AI Response:`);
            console.log(`   Latency: ${latencyMs}ms`);
            console.log(`   Content length: ${content.length} chars`);
            console.log(`   Content preview: "${content.substring(0, 100)}..."`);
            console.log(`   Input tokens: ${usage?.prompt_tokens ?? 'N/A'}`);
            console.log(`   Output tokens: ${usage?.completion_tokens ?? 'N/A'}`);

            if (!content) {
                console.error(`   ⚠️  EMPTY RESPONSE from Z.AI!`);
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

            console.error(`\n⚠️  Z.AI API Error: ${errorMessage}`);
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

// Available Z.AI models
export const ZAI_MODELS = [
    {
        id: 'glm-4.6',
        name: 'GLM 4.6 (Coding Plan)',
        contextWindow: 131072,
        description: 'Z.AI GLM 4.6 - coding-focused model via Coding Plan',
        isFree: false,
    },
    {
        id: 'glm-4.5',
        name: 'GLM 4.5',
        contextWindow: 131072,
        description: 'Z.AI GLM 4.5 - previous generation',
        isFree: false,
    },
];
