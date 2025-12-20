/**
 * COON Base Compression Strategy
 *
 * Abstract base class for all compression strategies.
 * Implements the Strategy Pattern for flexible compression approaches.
 */

import { CompressionResult, CompressionStrategyType, StrategyConfig } from "./types";
import { getWidgetAbbreviations, getPropertyAbbreviations, getKeywordAbbreviations } from "../data";
import { LanguageHandler, LanguageRegistry } from "../languages";

/**
 * Abstract base class for compression strategies
 */
export abstract class CompressionStrategy {
  protected config: StrategyConfig;
  protected widgets: Record<string, string>;
  protected properties: Record<string, string>;
  protected keywords: Record<string, string>;
  protected languageHandler: LanguageHandler | null = null;

  constructor(config: StrategyConfig, language?: string) {
    this.config = config;

    // Try to use language handler if available
    if (language && LanguageRegistry.isRegistered(language)) {
      this.languageHandler = LanguageRegistry.get(language);
      this.widgets = this.languageHandler.getTypeAbbreviations();
      this.properties = this.languageHandler.getPropertyAbbreviations();
      this.keywords = this.languageHandler.getKeywords();
    } else {
      // Fallback to legacy data loader
      this.widgets = getWidgetAbbreviations();
      this.properties = getPropertyAbbreviations();
      this.keywords = getKeywordAbbreviations();
    }
  }

  /**
   * Get the strategy type
   */
  abstract get strategyType(): CompressionStrategyType;

  /**
   * Compress code using this strategy
   */
  abstract compress(code: string): string;

  /**
   * Get configuration for this strategy
   */
  getConfig(): StrategyConfig {
    return this.config;
  }

  /**
   * Check if this strategy is suitable for the given code
   */
  isSuitable(code: string): boolean {
    const codeSize = code.length;

    if (codeSize < this.config.minCodeSize) {
      return false;
    }

    if (this.config.maxCodeSize !== null && codeSize > this.config.maxCodeSize) {
      return false;
    }

    return true;
  }

  /**
   * Estimate token count (rough: 4 chars ≈ 1 token)
   */
  protected countTokens(text: string): number {
    return Math.floor(text.length / 4);
  }

  /**
   * Remove comments from code
   */
  protected removeComments(code: string): string {
    // Remove single-line comments
    let result = code.replace(/\/\/.*$/gm, "");
    // Remove multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    return result;
  }

  /**
   * Remove excess whitespace
   */
  protected normalizeWhitespace(code: string): string {
    // Collapse multiple spaces to single space
    let result = code.replace(/\s+/g, " ");
    // Remove spaces around punctuation
    result = result.replace(/ ?([:,{}\[\]()]) ?/g, "$1");
    return result.trim();
  }

  /**
   * Apply keyword abbreviations
   */
  protected applyKeywordAbbreviations(code: string): string {
    let result = code;
    for (const [keyword, abbrev] of Object.entries(this.keywords)) {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      result = result.replace(regex, abbrev);
    }
    return result;
  }

  /**
   * Apply widget abbreviations
   */
  protected applyWidgetAbbreviations(code: string): string {
    let result = code;
    for (const [widget, abbrev] of Object.entries(this.widgets)) {
      const regex = new RegExp(`\\b${widget}\\b`, "g");
      result = result.replace(regex, abbrev);
    }
    return result;
  }

  /**
   * Apply property abbreviations
   */
  protected applyPropertyAbbreviations(code: string): string {
    let result = code;
    for (const [prop, abbrev] of Object.entries(this.properties)) {
      // Properties include colons, so match literally
      result = result.replace(new RegExp(prop.replace(":", "\\:"), "g"), abbrev);
    }
    return result;
  }

  /**
   * Create compression result
   */
  protected createResult(
    originalCode: string,
    compressedCode: string,
    startTime: number
  ): CompressionResult {
    const originalTokens = this.countTokens(originalCode);
    const compressedTokens = this.countTokens(compressedCode);
    const tokenSavings = originalTokens - compressedTokens;
    const percentageSaved = originalTokens > 0 ? (tokenSavings / originalTokens) * 100 : 0;

    return {
      compressedCode,
      originalTokens,
      compressedTokens,
      tokenSavings,
      percentageSaved,
      strategyUsed: this.strategyType,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
