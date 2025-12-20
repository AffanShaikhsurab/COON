/**
 * COON Aggressive Compression Strategy
 *
 * Maximum compression with ultra-short abbreviations.
 * Target: 60-70% token reduction
 */

import { CompressionStrategy } from "./base";
import { CompressionStrategyType, StrategyConfig } from "./types";

/**
 * Default configuration for Aggressive strategy
 */
export const AGGRESSIVE_CONFIG: StrategyConfig = {
  name: "Aggressive",
  description: "Maximum compression with ultra-short abbreviations",
  minCodeSize: 100,
  maxCodeSize: null,
  expectedRatio: 0.65,
  preserveFormatting: false,
  preserveComments: false,
  aggressiveWhitespace: true,
  widgetAbbreviation: true,
  propertyAbbreviation: true,
  keywordAbbreviation: true,
  useAstAnalysis: false,
  useComponentRegistry: false,
  parameters: {
    abbreviationLevel: "ultra",
    removeTypeAnnotations: true,
    inlineConstructors: true,
    mergeSimilarWidgets: true,
  },
};

/**
 * Aggressive compression strategy
 */
export class AggressiveStrategy extends CompressionStrategy {
  constructor(config?: Partial<StrategyConfig>, language?: string) {
    super({ ...AGGRESSIVE_CONFIG, ...config }, language);
  }

  get strategyType(): CompressionStrategyType {
    return CompressionStrategyType.AGGRESSIVE;
  }

  compress(code: string): string {
    let result = code;

    // Step 1: Remove comments
    result = this.removeComments(result);

    // Step 2: Remove import statements
    result = result.replace(/^import.*?;\s*/gm, "");

    // Step 3: Remove type annotations
    if (this.config.parameters.removeTypeAnnotations) {
      result = this.removeTypeAnnotations(result);
    }

    // Step 4: Apply keyword abbreviations
    result = this.applyKeywordAbbreviations(result);

    // Step 5: Apply widget abbreviations
    result = this.applyWidgetAbbreviations(result);

    // Step 6: Apply property abbreviations
    result = this.applyPropertyAbbreviations(result);

    // Step 7: Apply ultra compression transforms
    result = this.applyUltraCompression(result);

    // Step 8: Aggressive whitespace removal
    result = this.normalizeWhitespace(result);

    // Step 9: Replace parentheses with braces
    result = result.replace(/\(/g, "{").replace(/\)/g, "}");

    // Step 10: Optimize strings
    result = result.replace(/([A-Z]){"([^"]*)"}/g, '$1"$2"');

    return result;
  }

  /**
   * Remove type annotations from code
   */
  private removeTypeAnnotations(code: string): string {
    // Remove explicit type annotations like `: String`, `: int`
    let result = code.replace(/:\s*[A-Z][a-zA-Z0-9<>,\s]*(?=\s*[=;,)])/g, "");
    // Remove `<Type>` generics
    result = result.replace(/<[A-Z][a-zA-Z0-9<>,\s]*>/g, "");
    return result;
  }

  /**
   * Apply ultra compression transforms
   */
  private applyUltraCompression(code: string): string {
    let result = code;

    // Method prefix
    result = result.replace(/Widget\s+build\s*\([^)]*\)\s*\{/g, "m:b");

    // EdgeInsets shorthand
    result = result.replace(/EdgeInsets\.all\((\d+(?:\.\d+)?)\)/g, "pd:$1");
    result = result.replace(/EdgeInsets\.symmetric\([^)]+\)/g, (match) => {
      const h = match.match(/horizontal:\s*(\d+(?:\.\d+)?)/);
      const v = match.match(/vertical:\s*(\d+(?:\.\d+)?)/);
      return `pd:${h?.[1] || "0"},${v?.[1] || "0"}`;
    });

    // Size shorthand
    result = result.replace(/Size\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)/g, "sz:$1,$2");

    // Boolean shorthand
    result = result.replace(/\btrue\b/g, "1");
    result = result.replace(/\bfalse\b/g, "0");

    // Remove `new` keyword
    result = result.replace(/\bnew\s+/g, "");

    // FontWeight shorthand
    result = result.replace(/FontWeight\.bold/g, "fw:b");
    result = result.replace(/FontWeight\.normal/g, "fw:n");
    result = result.replace(/FontWeight\.w(\d+)/g, "fw:$1");

    // Colors shorthand
    result = result.replace(/Colors\.(\w+)/g, "cl:$1");
    result = result.replace(/Color\(0x([0-9A-Fa-f]+)\)/g, "#$1");

    // MainAxisAlignment shorthand
    result = result.replace(/MainAxisAlignment\.(\w+)/g, "ma:$1");
    result = result.replace(/CrossAxisAlignment\.(\w+)/g, "ca:$1");

    return result;
  }
}
