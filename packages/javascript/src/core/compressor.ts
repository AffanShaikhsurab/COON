/**
 * COON Core - Compressor
 * 
 * Main compression engine using the Strategy Pattern.
 */

import { 
    CompressionConfig,
    createCompressionConfig 
} from './config';
import { CompressionResult, createCompressionResult } from './result';
import { 
    CompressionStrategyType,
    StrategySelector,
    BasicStrategy,
    AggressiveStrategy,
    ASTBasedStrategy,
    ComponentRefStrategy,
    CompressionStrategy
} from '../strategies';

/**
 * COON Compressor Class
 * 
 * Main entry point for compression operations.
 */
export class Compressor {
    private config: CompressionConfig;
    private strategySelector: StrategySelector;
    private language: string;

    constructor(config?: Partial<CompressionConfig> & { language?: string }) {
        this.config = createCompressionConfig(config);
        this.strategySelector = new StrategySelector();
        this.language = config?.language || 'dart'; // Default to Dart
    }

    /**
     * Compress Dart code to COON format
     */
    compress(code: string, options?: { strategy?: CompressionStrategyType; language?: string }): CompressionResult {
        const startTime = Date.now();
        const language = options?.language || this.language;

        // Determine strategy
        const strategyType = options?.strategy 
            || (this.config.strategy === CompressionStrategyType.AUTO
                ? this.strategySelector.selectStrategy(code)
                : this.config.strategy);

        // Create strategy instance with language
        const strategy = this.createStrategy(strategyType, language);

        // Perform compression
        let compressedCode = strategy.compress(code);

        // Apply custom abbreviations if provided
        if (Object.keys(this.config.customAbbreviations).length > 0) {
            compressedCode = this.applyCustomAbbreviations(compressedCode);
        }

        // Calculate processing time
        const processingTimeMs = Date.now() - startTime;

        // Create result
        const result = createCompressionResult(
            code,
            compressedCode,
            strategyType,
            processingTimeMs
        );

        // Add metadata
        result.metadata = this.analyzeCode(code);

        // Update strategy metrics
        this.strategySelector.updateMetrics(
            strategyType,
            result.percentageSaved / 100,
            result.tokenSavings,
            processingTimeMs,
            true
        );

        return result;
    }

    /**
     * Create strategy instance with language support
     */
    private createStrategy(strategyType: CompressionStrategyType, language: string): CompressionStrategy {
        switch (strategyType) {
            case CompressionStrategyType.AGGRESSIVE:
                return new AggressiveStrategy(undefined, language);
            case CompressionStrategyType.AST_BASED:
                return new ASTBasedStrategy(undefined, language);
            case CompressionStrategyType.COMPONENT_REF:
                return new ComponentRefStrategy(undefined, language);
            case CompressionStrategyType.BASIC:
            default:
                return new BasicStrategy(undefined, language);
        }
    }

    /**
     * Apply custom abbreviations
     */
    private applyCustomAbbreviations(code: string): string {
        let result = code;
        for (const [full, abbrev] of Object.entries(this.config.customAbbreviations)) {
            result = result.replace(new RegExp(full, 'g'), abbrev);
        }
        return result;
    }

    /**
     * Analyze code for metadata
     */
    private analyzeCode(code: string): {
        widgetCount: number;
        classCount: number;
        methodCount: number;
        complexity: number;
        abbreviationsApplied: number;
    } {
        return {
            widgetCount: (code.match(/\b[A-Z][a-zA-Z]*\(/g) || []).length,
            classCount: (code.match(/\bclass\s+/g) || []).length,
            methodCount: (code.match(/\b\w+\s*\([^)]*\)\s*{/g) || []).length,
            complexity: this.estimateComplexity(code),
            abbreviationsApplied: 0 // Updated during compression
        };
    }

    /**
     * Estimate code complexity
     */
    private estimateComplexity(code: string): number {
        let complexity = 0;
        
        // Nesting depth
        let maxDepth = 0;
        let depth = 0;
        for (const char of code) {
            if (char === '{' || char === '(') {
                depth++;
                maxDepth = Math.max(maxDepth, depth);
            } else if (char === '}' || char === ')') {
                depth--;
            }
        }
        complexity += maxDepth * 5;

        // Control flow
        complexity += (code.match(/\bif\b|\belse\b|\bswitch\b/g) || []).length * 3;
        complexity += (code.match(/\bfor\b|\bwhile\b/g) || []).length * 4;

        return complexity;
    }

    /**
     * Get current configuration
     */
    getConfig(): CompressionConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(updates: Partial<CompressionConfig>): void {
        this.config = { ...this.config, ...updates };
    }
}
