/**
 * COON Core - Configuration Types
 */

import { CompressionStrategyType } from "../strategies/types";

/**
 * Compression configuration
 */
export interface CompressionConfig {
  /** Compression strategy to use */
  strategy: CompressionStrategyType;
  /** Whether to analyze code before compression */
  analyzeCode: boolean;
  /** Whether to validate compression */
  validate: boolean;
  /** Enable metrics collection */
  enableMetrics: boolean;
  /** Preserve comments in output */
  preserveComments: boolean;
  /** Maximum line length (0 = no limit) */
  maxLineLength: number;
  /** Custom abbreviations to apply */
  customAbbreviations: Record<string, string>;
}

/**
 * Decompression configuration
 */
export interface DecompressionConfig {
  /** Format output with proper indentation */
  formatOutput: boolean;
  /** Indent size in spaces */
  indentSize: number;
  /** Maximum line length (0 = no limit) */
  maxLineLength: number;
  /** Validate decompressed output */
  validate: boolean;
}

/**
 * Default compression configuration
 */
export const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  strategy: CompressionStrategyType.AUTO,
  analyzeCode: true,
  validate: false,
  enableMetrics: false,
  preserveComments: false,
  maxLineLength: 0,
  customAbbreviations: {},
};

/**
 * Default decompression configuration
 */
export const DEFAULT_DECOMPRESSION_CONFIG: DecompressionConfig = {
  formatOutput: true,
  indentSize: 2,
  maxLineLength: 80,
  validate: false,
};

/**
 * Create compression config with defaults
 */
export function createCompressionConfig(overrides?: Partial<CompressionConfig>): CompressionConfig {
  return { ...DEFAULT_COMPRESSION_CONFIG, ...overrides };
}

/**
 * Create decompression config with defaults
 */
export function createDecompressionConfig(
  overrides?: Partial<DecompressionConfig>
): DecompressionConfig {
  return { ...DEFAULT_DECOMPRESSION_CONFIG, ...overrides };
}
