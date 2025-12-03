/**
 * COON Basic Compression Strategy
 * 
 * Simple compression with keyword and widget abbreviations.
 * Target: 40-50% token reduction
 */

import { CompressionStrategy } from './base';
import { CompressionStrategyType, StrategyConfig } from './types';

/**
 * Default configuration for Basic strategy
 */
export const BASIC_CONFIG: StrategyConfig = {
    name: 'Basic',
    description: 'Simple keyword and widget abbreviations with minimal processing',
    minCodeSize: 0,
    maxCodeSize: null,
    expectedRatio: 0.4,
    preserveFormatting: false,
    preserveComments: false,
    aggressiveWhitespace: true,
    widgetAbbreviation: true,
    propertyAbbreviation: true,
    keywordAbbreviation: true,
    useAstAnalysis: false,
    useComponentRegistry: false,
    parameters: {
        abbreviationLevel: 'standard'
    }
};

/**
 * Basic compression strategy
 */
export class BasicStrategy extends CompressionStrategy {
    constructor(config?: Partial<StrategyConfig>, language?: string) {
        super({ ...BASIC_CONFIG, ...config }, language);
    }

    get strategyType(): CompressionStrategyType {
        return CompressionStrategyType.BASIC;
    }

    compress(code: string): string {
        let result = code;

        // Step 1: Remove comments
        if (!this.config.preserveComments) {
            result = this.removeComments(result);
        }

        // Step 2: Apply keyword abbreviations
        if (this.config.keywordAbbreviation) {
            result = this.applyKeywordAbbreviations(result);
        }

        // Step 3: Apply widget abbreviations
        if (this.config.widgetAbbreviation) {
            result = this.applyWidgetAbbreviations(result);
        }

        // Step 4: Apply property abbreviations
        if (this.config.propertyAbbreviation) {
            result = this.applyPropertyAbbreviations(result);
        }

        // Step 5: Normalize whitespace
        if (this.config.aggressiveWhitespace) {
            result = this.normalizeWhitespace(result);
        }

        return result;
    }
}
