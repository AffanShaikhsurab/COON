/**
 * COON Language Registry
 * 
 * Central registry for language handlers, enabling dynamic registration
 * and automatic language detection.
 */

import { LanguageHandler, supportsExtension } from './types';

/**
 * Type for a language handler constructor
 */
type LanguageHandlerConstructor = new () => LanguageHandler;

/**
 * Language Registry
 * 
 * Manages language handlers and provides detection capabilities.
 */
export class LanguageRegistry {
    private static handlers: Map<string, LanguageHandlerConstructor> = new Map();
    private static instances: Map<string, LanguageHandler> = new Map();
    
    /**
     * Register a language handler
     */
    static register(name: string, handlerClass: LanguageHandlerConstructor): void {
        const normalizedName = name.toLowerCase();
        this.handlers.set(normalizedName, handlerClass);
        // Clear cached instance if re-registering
        this.instances.delete(normalizedName);
    }
    
    /**
     * Get a language handler by name
     * @throws Error if language is not registered
     */
    static get(name: string): LanguageHandler {
        const normalizedName = name.toLowerCase();
        
        if (!this.instances.has(normalizedName)) {
            const HandlerClass = this.handlers.get(normalizedName);
            if (!HandlerClass) {
                const available = Array.from(this.handlers.keys()).join(', ') || 'none';
                throw new Error(
                    `Unknown language: '${name}'. Available languages: ${available}`
                );
            }
            this.instances.set(normalizedName, new HandlerClass());
        }
        
        return this.instances.get(normalizedName)!;
    }
    
    /**
     * Auto-detect language from source code
     * @returns Language name if detected with confidence > 0.5, else null
     */
    static detect(code: string): string | null {
        if (this.handlers.size === 0) {
            return null;
        }
        
        let bestMatch: string | null = null;
        let bestScore = 0;
        
        for (const name of this.handlers.keys()) {
            const handler = this.get(name);
            const score = handler.detectLanguage(code);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = name;
            }
        }
        
        return bestScore > 0.5 ? bestMatch : null;
    }
    
    /**
     * Detect language from file extension
     */
    static detectFromExtension(extension: string): string | null {
        for (const name of this.handlers.keys()) {
            const handler = this.get(name);
            if (supportsExtension(handler.spec, extension)) {
                return name;
            }
        }
        return null;
    }
    
    /**
     * List all registered language names
     */
    static listLanguages(): string[] {
        return Array.from(this.handlers.keys());
    }
    
    /**
     * Check if a language is registered
     */
    static isRegistered(name: string): boolean {
        return this.handlers.has(name.toLowerCase());
    }
    
    /**
     * Clear all registered handlers (useful for testing)
     */
    static clear(): void {
        this.handlers.clear();
        this.instances.clear();
    }
}

// Auto-register default languages
function registerDefaultLanguages(): void {
    try {
        // Import and register Dart handler
        const { DartLanguageHandler } = require('./dart');
        LanguageRegistry.register('dart', DartLanguageHandler);
    } catch (e) {
        // Dart handler not available
    }
}

registerDefaultLanguages();
