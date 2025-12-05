/**
 * COON Core - Result Types
 */

import { CompressionStrategyType } from "../strategies/types";

/**
 * Compression result
 */
export interface CompressionResult {
  /** Compressed COON format code */
  compressedCode: string;
  /** Original code (for reference) */
  originalCode: string;
  /** Original token count estimate */
  originalTokens: number;
  /** Compressed token count estimate */
  compressedTokens: number;
  /** Number of tokens saved */
  tokenSavings: number;
  /** Percentage of tokens saved */
  percentageSaved: number;
  /** Strategy used for compression */
  strategyUsed: CompressionStrategyType;
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Whether compression was validated */
  validated: boolean;
  /** Validation passed (if validated) */
  validationPassed?: boolean;
  /** Any warnings generated */
  warnings: string[];
  /** Metadata about compression */
  metadata: CompressionMetadata;
}

/**
 * Compression metadata
 */
export interface CompressionMetadata {
  /** Number of widgets found */
  widgetCount: number;
  /** Number of classes found */
  classCount: number;
  /** Number of methods found */
  methodCount: number;
  /** Estimated complexity score */
  complexity: number;
  /** Abbreviations applied */
  abbreviationsApplied: number;
}

/**
 * Decompression result
 */
export interface DecompressionResult {
  /** Decompressed Dart code */
  decompressedCode: string;
  /** Original compressed code */
  compressedCode: string;
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Whether decompression was validated */
  validated: boolean;
  /** Any warnings generated */
  warnings: string[];
}

/**
 * Create empty compression result
 */
export function createCompressionResult(
  originalCode: string,
  compressedCode: string,
  strategy: CompressionStrategyType,
  processingTimeMs: number,
): CompressionResult {
  const originalTokens = Math.floor(originalCode.length / 4);
  const compressedTokens = Math.floor(compressedCode.length / 4);
  const tokenSavings = originalTokens - compressedTokens;
  const percentageSaved =
    originalTokens > 0 ? (tokenSavings / originalTokens) * 100 : 0;

  return {
    compressedCode,
    originalCode,
    originalTokens,
    compressedTokens,
    tokenSavings,
    percentageSaved,
    strategyUsed: strategy,
    processingTimeMs,
    validated: false,
    warnings: [],
    metadata: {
      widgetCount: 0,
      classCount: 0,
      methodCount: 0,
      complexity: 0,
      abbreviationsApplied: 0,
    },
  };
}

/**
 * Create decompression result
 */
export function createDecompressionResult(
  compressedCode: string,
  decompressedCode: string,
  processingTimeMs: number,
): DecompressionResult {
  return {
    decompressedCode,
    compressedCode,
    processingTimeMs,
    validated: false,
    warnings: [],
  };
}
