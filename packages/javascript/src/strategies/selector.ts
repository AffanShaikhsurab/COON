/**
 * COON Strategy Selector
 *
 * Intelligent strategy selection based on code analysis.
 */

import {
  CompressionStrategyType,
  StrategyConfig,
  StrategyMetrics,
} from "./types";
import { CompressionStrategy } from "./base";
import { BasicStrategy, BASIC_CONFIG } from "./basic";
import { AggressiveStrategy, AGGRESSIVE_CONFIG } from "./aggressive";
import { ASTBasedStrategy, AST_BASED_CONFIG } from "./ast_based";
import { ComponentRefStrategy, COMPONENT_REF_CONFIG } from "./component_ref";

/**
 * All strategy configurations
 */
export const STRATEGY_CONFIGURATIONS: Record<
  CompressionStrategyType,
  StrategyConfig
> = {
  [CompressionStrategyType.AUTO]: {
    name: "Auto",
    description: "Automatically select best strategy",
    minCodeSize: 0,
    maxCodeSize: null,
    expectedRatio: 0.6,
    preserveFormatting: false,
    preserveComments: false,
    aggressiveWhitespace: true,
    widgetAbbreviation: true,
    propertyAbbreviation: true,
    keywordAbbreviation: true,
    useAstAnalysis: false,
    useComponentRegistry: false,
    parameters: {},
  },
  [CompressionStrategyType.BASIC]: BASIC_CONFIG,
  [CompressionStrategyType.AGGRESSIVE]: AGGRESSIVE_CONFIG,
  [CompressionStrategyType.AST_BASED]: AST_BASED_CONFIG,
  [CompressionStrategyType.COMPONENT_REF]: COMPONENT_REF_CONFIG,
};

/**
 * Strategy selector for intelligent compression
 */
export class StrategySelector {
  private metrics: Map<CompressionStrategyType, StrategyMetrics> = new Map();

  constructor() {
    this.initializeMetrics();
  }

  /**
   * Initialize metrics for all strategies
   */
  private initializeMetrics(): void {
    for (const [strategy, config] of Object.entries(STRATEGY_CONFIGURATIONS)) {
      this.metrics.set(strategy as CompressionStrategyType, {
        strategy: strategy as CompressionStrategyType,
        avgCompressionRatio: config.expectedRatio,
        avgTokensSaved: 0,
        processingTimeMs: 0,
        successRate: 1.0,
        reversibilityRate: 1.0,
        useCount: 0,
      });
    }
  }

  /**
   * Select best strategy for given code
   */
  selectStrategy(
    code: string,
    hasRegistry: boolean = false,
    preferSpeed: boolean = false,
  ): CompressionStrategyType {
    const codeSize = code.length;
    const widgetCount = (code.match(/\b[A-Z][a-zA-Z]*\(/g) || []).length;
    const classCount = (code.match(/\bclass\s+/g) || []).length;
    const complexity = this.estimateComplexity(code);

    const scores: Map<CompressionStrategyType, number> = new Map();

    for (const [strategy, config] of Object.entries(STRATEGY_CONFIGURATIONS)) {
      if (strategy === CompressionStrategyType.AUTO) continue;

      let score = 0;

      // Size compatibility
      if (config.minCodeSize <= codeSize) {
        if (config.maxCodeSize === null || codeSize <= config.maxCodeSize) {
          score += 30;
        }
      }

      // Widget density bonus for widget-heavy strategies
      if (config.widgetAbbreviation && widgetCount > 5) {
        score += Math.min(widgetCount * 2, 20);
      }

      // Class count consideration
      if (classCount > 1 && config.useAstAnalysis) {
        score += classCount * 5;
      }

      // Complexity-based selection
      if (complexity > 50 && config.useAstAnalysis) {
        score += 15;
      }

      // Registry bonus
      if (hasRegistry && config.useComponentRegistry) {
        score += 25;
      }

      // Speed preference
      if (preferSpeed && !config.useAstAnalysis) {
        score += 20;
      }

      // Expected ratio weighting
      score += config.expectedRatio * 30;

      // Historical performance
      const metrics = this.metrics.get(strategy as CompressionStrategyType);
      if (metrics && metrics.useCount > 0) {
        score += metrics.successRate * 10;
        score += metrics.avgCompressionRatio * 20;
      }

      scores.set(strategy as CompressionStrategyType, score);
    }

    // Select highest scoring strategy
    let bestStrategy = CompressionStrategyType.BASIC;
    let bestScore = 0;

    for (const [strategy, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategy;
      }
    }

    return bestStrategy;
  }

  /**
   * Estimate code complexity
   */
  private estimateComplexity(code: string): number {
    let complexity = 0;

    // Nesting depth
    const maxDepth = this.calculateMaxNesting(code);
    complexity += maxDepth * 5;

    // Number of conditionals
    complexity +=
      (code.match(/\bif\b|\belse\b|\bswitch\b|\?/g) || []).length * 3;

    // Number of loops
    complexity += (code.match(/\bfor\b|\bwhile\b|\bdo\b/g) || []).length * 4;

    // Method count
    complexity += (code.match(/\b\w+\s*\([^)]*\)\s*{/g) || []).length * 2;

    return complexity;
  }

  /**
   * Calculate maximum nesting depth
   */
  private calculateMaxNesting(code: string): number {
    let depth = 0;
    let maxDepth = 0;

    for (const char of code) {
      if (char === "{" || char === "(") {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      } else if (char === "}" || char === ")") {
        depth--;
      }
    }

    return maxDepth;
  }

  /**
   * Create strategy instance
   */
  createStrategy(strategyType: CompressionStrategyType): CompressionStrategy {
    switch (strategyType) {
      case CompressionStrategyType.AGGRESSIVE:
        return new AggressiveStrategy();
      case CompressionStrategyType.AST_BASED:
        return new ASTBasedStrategy();
      case CompressionStrategyType.COMPONENT_REF:
        return new ComponentRefStrategy();
      case CompressionStrategyType.BASIC:
      default:
        return new BasicStrategy();
    }
  }

  /**
   * Update metrics after compression
   */
  updateMetrics(
    strategy: CompressionStrategyType,
    compressionRatio: number,
    tokensSaved: number,
    timeMs: number,
    success: boolean,
  ): void {
    const metrics = this.metrics.get(strategy);
    if (!metrics) return;

    const count = metrics.useCount;
    metrics.avgCompressionRatio =
      (metrics.avgCompressionRatio * count + compressionRatio) / (count + 1);
    metrics.avgTokensSaved =
      (metrics.avgTokensSaved * count + tokensSaved) / (count + 1);
    metrics.processingTimeMs =
      (metrics.processingTimeMs * count + timeMs) / (count + 1);
    metrics.successRate =
      (metrics.successRate * count + (success ? 1 : 0)) / (count + 1);
    metrics.useCount++;
  }

  /**
   * Get metrics for a strategy
   */
  getMetrics(strategy: CompressionStrategyType): StrategyMetrics | undefined {
    return this.metrics.get(strategy);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): StrategyMetrics[] {
    return Array.from(this.metrics.values());
  }
}
