/**
 * COON Core - Decompressor
 *
 * Converts COON format back to Dart code.
 */

import { DecompressionConfig, createDecompressionConfig } from "./config";
import { DecompressionResult, createDecompressionResult } from "./result";
import {
  getReverseWidgetMap,
  getReversePropertyMap,
  getReverseKeywordMap,
} from "../data";
import { LanguageRegistry, DartLanguageHandler } from "../languages";

/**
 * COON Decompressor Class
 *
 * Main entry point for decompression operations.
 */
export class Decompressor {
  private config: DecompressionConfig;
  private reverseWidgets!: Record<string, string>;
  private reverseProperties!: Record<string, string>;
  private reverseKeywords!: Record<string, string>;
  private language: string;

  constructor(config?: Partial<DecompressionConfig> & { language?: string }) {
    this.config = createDecompressionConfig(config);
    this.language = config?.language || "dart"; // Default to Dart

    // Load reverse maps from language handler or fallback to data module
    this.loadReverseMaps();
  }

  /**
   * Load reverse abbreviation maps from language handler or fallback to data module
   */
  private loadReverseMaps(): void {
    // Ensure Dart handler is registered
    if (!LanguageRegistry.isRegistered(this.language)) {
      LanguageRegistry.register("dart", DartLanguageHandler);
    }

    try {
      const handler = LanguageRegistry.get(this.language);
      const abbrevs = handler.getReverseAbbreviationsByCategory();
      this.reverseWidgets = abbrevs.widgets;
      this.reverseProperties = abbrevs.properties;
      this.reverseKeywords = abbrevs.keywords;
    } catch {
      // Fallback to direct data module (for backwards compatibility)
      this.reverseWidgets = getReverseWidgetMap();
      this.reverseProperties = getReversePropertyMap();
      this.reverseKeywords = getReverseKeywordMap();
    }
  }

  /**
   * Decompress COON format to Dart code
   */
  decompress(compressedCode: string): DecompressionResult {
    const startTime = Date.now();

    // Perform decompression
    let decompressedCode = this.decompressBasic(compressedCode);

    // Format output if enabled
    if (this.config.formatOutput) {
      decompressedCode = this.formatCode(decompressedCode);
    }

    // Calculate processing time
    const processingTimeMs = Date.now() - startTime;

    return createDecompressionResult(
      compressedCode,
      decompressedCode,
      processingTimeMs,
    );
  }

  /**
   * Basic decompression
   */
  private decompressBasic(coon: string): string {
    let result = coon;

    // Reverse brace substitution
    result = result.replace(/{/g, "(").replace(/}/g, ")");

    // Reverse method prefix
    result = result.replace(/m:b/g, "Widget build(BuildContext context) {");

    // Reverse class abbreviation
    result = result.replace(/c:(\w+)<(\w+)/g, "class $1 extends $2");

    // Reverse EdgeInsets shorthand
    result = result.replace(/pd:(\d+(?:\.\d+)?)/g, "EdgeInsets.all($1)");
    result = result.replace(
      /pd:(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g,
      "EdgeInsets.symmetric(horizontal: $1, vertical: $2)",
    );

    // Reverse Size shorthand
    result = result.replace(
      /sz:(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g,
      "Size($1, $2)",
    );

    // Reverse boolean shorthand
    result = result.replace(/\b1\b(?=[,)\s}])/g, "true");
    result = result.replace(/\b0\b(?=[,)\s}])/g, "false");

    // Reverse FontWeight shorthand
    result = result.replace(/fw:b/g, "FontWeight.bold");
    result = result.replace(/fw:n/g, "FontWeight.normal");
    result = result.replace(/fw:(\d+)/g, "FontWeight.w$1");

    // Reverse Colors shorthand
    result = result.replace(/cl:(\w+)/g, "Colors.$1");
    result = result.replace(/#([0-9A-Fa-f]+)/g, "Color(0x$1)");

    // Reverse alignment shorthand
    result = result.replace(/ma:(\w+)/g, "MainAxisAlignment.$1");
    result = result.replace(/ca:(\w+)/g, "CrossAxisAlignment.$1");

    // Reverse keyword abbreviations
    for (const [abbrev, full] of Object.entries(this.reverseKeywords)) {
      // Handle special characters in abbreviations
      const escaped = abbrev.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`\\b${escaped}\\b`, "g"), full);
    }

    // Reverse widget abbreviations (single-letter, must be careful)
    for (const [abbrev, full] of Object.entries(this.reverseWidgets)) {
      // Only replace when followed by opening bracket
      const escaped = abbrev.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`\\b${escaped}(?=\\()`, "g"), full);
    }

    // Reverse property abbreviations
    for (const [abbrev, full] of Object.entries(this.reverseProperties)) {
      const escaped = abbrev.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escaped, "g"), full);
    }

    return result;
  }

  /**
   * Format decompressed code
   */
  private formatCode(code: string): string {
    const indent = " ".repeat(this.config.indentSize);
    let result = "";
    let depth = 0;
    let inString = false;
    let stringChar = "";

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const prevChar = i > 0 ? code[i - 1] : "";

      // Track string state
      if ((char === '"' || char === "'") && prevChar !== "\\") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (inString) {
        result += char;
        continue;
      }

      // Handle formatting
      if (char === "{" || char === "(") {
        result += char;
        depth++;
        result += "\n" + indent.repeat(depth);
      } else if (char === "}" || char === ")") {
        depth = Math.max(0, depth - 1);
        result += "\n" + indent.repeat(depth) + char;
      } else if (char === ",") {
        result += char + "\n" + indent.repeat(depth);
      } else if (char === ";") {
        result += char + "\n" + indent.repeat(depth);
      } else {
        result += char;
      }
    }

    // Clean up multiple newlines
    result = result.replace(/\n\s*\n/g, "\n");

    return result.trim();
  }

  /**
   * Get current configuration
   */
  getConfig(): DecompressionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<DecompressionConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

/**
 * Convenience function for decompression
 */
export function decompressCoon(compressedCode: string): string {
  const decompressor = new Decompressor();
  const result = decompressor.decompress(compressedCode);
  return result.decompressedCode;
}
