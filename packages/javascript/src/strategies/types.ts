/**
 * COON Strategies - Type Definitions
 */

/**
 * Compression strategy enum
 */
export enum CompressionStrategyType {
    AUTO = 'auto',
    BASIC = 'basic',
    AGGRESSIVE = 'aggressive',
    AST_BASED = 'ast_based',
    COMPONENT_REF = 'component_ref'
}

/**
 * Strategy configuration interface
 */
export interface StrategyConfig {
    name: string;
    description: string;
    minCodeSize: number;
    maxCodeSize: number | null;
    expectedRatio: number;
    preserveFormatting: boolean;
    preserveComments: boolean;
    aggressiveWhitespace: boolean;
    widgetAbbreviation: boolean;
    propertyAbbreviation: boolean;
    keywordAbbreviation: boolean;
    useAstAnalysis: boolean;
    useComponentRegistry: boolean;
    parameters: Record<string, unknown>;
}

/**
 * Strategy metrics for tracking performance
 */
export interface StrategyMetrics {
    strategy: CompressionStrategyType;
    avgCompressionRatio: number;
    avgTokensSaved: number;
    processingTimeMs: number;
    successRate: number;
    reversibilityRate: number;
    useCount: number;
}

/**
 * Result of compression operation
 */
export interface CompressionResult {
    compressedCode: string;
    originalTokens: number;
    compressedTokens: number;
    tokenSavings: number;
    percentageSaved: number;
    strategyUsed: CompressionStrategyType;
    processingTimeMs: number;
}
