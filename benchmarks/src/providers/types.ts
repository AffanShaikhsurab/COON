/**
 * Provider Types for COON Benchmarks
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
  error?: string;
}

export interface ProviderConfig {
  apiKey: string;
  model: string;
  maxRetries?: number;
  timeout?: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'gemini' | 'groq' | 'openrouter';
  contextWindow: number;
  description?: string;
  isFree: boolean;
}

export interface ProviderInterface {
  readonly name: string;
  readonly model: string;
  
  /**
   * Send a chat completion request
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
  
  /**
   * Check if the provider is configured correctly
   */
  isConfigured(): boolean;
  
  /**
   * Get rate limit info
   */
  getRateLimitInfo(): RateLimitInfo;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
}

export interface RateLimitInfo {
  requestsPerMinute: number;
  tokensPerMinute: number;
}
