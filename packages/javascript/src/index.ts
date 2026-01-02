/**
 * COON - Code-Oriented Object Notation
 *
 * Token-efficient code compression for Dart/Flutter and LLM contexts.
 *
 * @packageDocumentation
 */

// Version
export const VERSION = "1.0.0";

// Data module
export {
  loadWidgets,
  loadProperties,
  loadKeywords,
  getWidgetAbbreviations,
  getPropertyAbbreviations,
  getKeywordAbbreviations,
  getReverseWidgetMap,
  getReversePropertyMap,
  getReverseKeywordMap,
  getAllAbbreviations,
  clearCache,
  AbbreviationData,
} from "./data";

// Strategies
export {
  CompressionStrategyType,
  StrategyConfig,
  StrategyMetrics,
  CompressionStrategy,
  BasicStrategy,
  AggressiveStrategy,
  ASTBasedStrategy,
  ComponentRefStrategy,
  StrategySelector,
  STRATEGY_CONFIGURATIONS,
  BASIC_CONFIG,
  AGGRESSIVE_CONFIG,
  AST_BASED_CONFIG,
  COMPONENT_REF_CONFIG,
} from "./strategies";

// Core
export {
  Compressor,
  Decompressor,
  decompressCoon,
  CompressionConfig,
  DecompressionConfig,
  DEFAULT_COMPRESSION_CONFIG,
  DEFAULT_DECOMPRESSION_CONFIG,
  createCompressionConfig,
  createDecompressionConfig,
  CompressionResult,
  CompressionMetadata,
  DecompressionResult,
  createCompressionResult,
  createDecompressionResult,
} from "./core";

// Parser
export {
  TokenType,
  Token,
  DartLexer,
  NodeType,
  ASTNode,
  ProgramNode,
  ClassDeclarationNode,
  MethodDeclarationNode,
  DartParser,
} from "./parser";

// Utils
export {
  CompressionValidator,
  ValidationResult,
  ComponentRegistry,
  Component,
  createDefaultRegistry,
  DartFormatter,
  FormatterOptions,
  DEFAULT_FORMATTER_OPTIONS,
} from "./utils";

// Languages (new language abstraction layer)
export {
  LanguageHandler,
  LanguageSpec,
  LanguageRegistry,
  DartLanguageHandler,
  supportsExtension,
  getDisplayName,
} from "./languages";

// Convenience functions
import { Compressor } from "./core";
import { CompressionStrategyType } from "./strategies";

/**
 * Compress Dart code to COON format
 *
 * @param code - Dart source code
 * @param strategy - Compression strategy (default: 'auto')
 * @param language - Target language (default: 'dart')
 * @returns Compressed COON code
 */
export function compressDart(
  code: string,
  strategy: CompressionStrategyType = CompressionStrategyType.AUTO,
  language: string = "dart"
): string {
  const compressor = new Compressor({ language });
  const result = compressor.compress(code, { strategy });
  return result.compressedCode;
}

/**
 * Compress with full result
 *
 * @param code - Dart source code
 * @param strategy - Compression strategy
 * @param language - Target language (default: 'dart')
 * @returns Full compression result with metrics
 */
export function compress(
  code: string,
  strategy: CompressionStrategyType = CompressionStrategyType.AUTO,
  language: string = "dart"
) {
  const compressor = new Compressor({ language });
  return compressor.compress(code, { strategy });
}

// Browser-compatible module (no Node.js dependencies)
export * from "./browser";
