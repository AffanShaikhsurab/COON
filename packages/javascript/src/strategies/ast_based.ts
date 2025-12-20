/**
 * COON AST-Based Compression Strategy
 *
 * Uses abstract syntax tree analysis for intelligent compression.
 * Target: 55-65% token reduction with semantic preservation
 */

import { CompressionStrategy } from "./base";
import { CompressionStrategyType, StrategyConfig } from "./types";

/**
 * Default configuration for AST-Based strategy
 */
export const AST_BASED_CONFIG: StrategyConfig = {
  name: "AST-Based",
  description: "Uses abstract syntax tree analysis for intelligent compression",
  minCodeSize: 300,
  maxCodeSize: null,
  expectedRatio: 0.6,
  preserveFormatting: false,
  preserveComments: true,
  aggressiveWhitespace: true,
  widgetAbbreviation: true,
  propertyAbbreviation: true,
  keywordAbbreviation: true,
  useAstAnalysis: true,
  useComponentRegistry: false,
  parameters: {
    optimizeTreeStructure: true,
    eliminateRedundantNodes: true,
    preserveSemantics: true,
  },
};

/**
 * AST node interface
 */
interface ASTNode {
  type: string;
  name?: string;
  children: ASTNode[];
  value?: string;
  properties?: Record<string, string>;
}

/**
 * AST-Based compression strategy
 */
export class ASTBasedStrategy extends CompressionStrategy {
  constructor(config?: Partial<StrategyConfig>, language?: string) {
    super({ ...AST_BASED_CONFIG, ...config }, language);
  }

  get strategyType(): CompressionStrategyType {
    return CompressionStrategyType.AST_BASED;
  }

  compress(code: string): string {
    let result = code;

    // Step 1: Parse to AST-like structure
    const structure = this.parseStructure(result);

    // Step 2: Optimize structure
    const optimized = this.optimizeStructure(structure);

    // Step 3: Serialize back to compressed form
    result = this.serializeStructure(optimized, code);

    // Step 4: Apply standard abbreviations
    result = this.applyKeywordAbbreviations(result);
    result = this.applyWidgetAbbreviations(result);
    result = this.applyPropertyAbbreviations(result);

    // Step 5: Normalize whitespace
    if (this.config.aggressiveWhitespace) {
      result = this.normalizeWhitespace(result);
    }

    return result;
  }

  /**
   * Parse code into a simplified AST structure
   */
  private parseStructure(code: string): ASTNode[] {
    const nodes: ASTNode[] = [];

    // Parse class definitions
    const classRegex =
      /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+(?:with|implements)\s+[\w,\s]+)?\s*\{/g;
    let match;

    while ((match = classRegex.exec(code)) !== null) {
      nodes.push({
        type: "class",
        name: match[1],
        children: [],
        properties: {
          extends: match[2] || "",
        },
      });
    }

    // Parse widget instantiations
    const widgetRegex = /(\w+)\s*\(\s*(?:([^)]+))?\s*\)/g;
    while ((match = widgetRegex.exec(code)) !== null) {
      if (this.widgets[match[1]]) {
        nodes.push({
          type: "widget",
          name: match[1],
          children: [],
          value: match[2] || "",
        });
      }
    }

    return nodes;
  }

  /**
   * Optimize the AST structure
   */
  private optimizeStructure(nodes: ASTNode[]): ASTNode[] {
    // Group related nodes
    const optimized: ASTNode[] = [];

    for (const node of nodes) {
      // Check for redundant nesting
      if (this.isRedundantWrapper(node)) {
        // Flatten redundant wrappers
        optimized.push(...node.children);
      } else {
        optimized.push(node);
      }
    }

    return optimized;
  }

  /**
   * Check if a node is a redundant wrapper
   */
  private isRedundantWrapper(node: ASTNode): boolean {
    // Container with single child
    if (
      node.type === "widget" &&
      (node.name === "Container" || node.name === "Center") &&
      node.children.length === 1
    ) {
      return true;
    }
    return false;
  }

  /**
   * Serialize structure back to compressed code
   */
  private serializeStructure(_nodes: ASTNode[], originalCode: string): string {
    // For now, use original code with structure-aware compression
    let result = originalCode;

    // Remove comments but preserve important ones
    if (!this.config.preserveComments) {
      result = this.removeComments(result);
    } else {
      // Only remove TODO/FIXME comments
      result = result.replace(/\/\/\s*(TODO|FIXME).*$/gm, "");
    }

    // Optimize widget nesting
    result = this.optimizeWidgetNesting(result);

    return result;
  }

  /**
   * Optimize widget nesting patterns
   */
  private optimizeWidgetNesting(code: string): string {
    let result = code;

    // Flatten simple Container(child: X) to just X when no other properties
    result = result.replace(/Container\s*\(\s*child:\s*([^,)]+)\s*\)/g, "$1");

    // Merge adjacent SizedBox
    result = result.replace(
      /SizedBox\s*\(\s*height:\s*(\d+)\s*\)\s*,\s*SizedBox\s*\(\s*height:\s*(\d+)\s*\)/g,
      (_, h1, h2) => `SizedBox(height:${parseInt(h1) + parseInt(h2)})`
    );

    return result;
  }
}
