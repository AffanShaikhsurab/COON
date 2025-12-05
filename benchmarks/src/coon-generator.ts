/**
 * COON Generator for Benchmarks
 * 
 * Uses the actual COON SDK to generate compressed code from Dart source.
 * This ensures benchmark samples use real compression output.
 */

import { Compressor, CompressionStrategyType } from 'coon-format';

// Singleton compressor instance
let compressor: Compressor | null = null;

/**
 * Get or create the COON compressor instance
 */
function getCompressor(): Compressor {
  if (!compressor) {
    compressor = new Compressor({
      strategy: CompressionStrategyType.COMPONENT_REF,  // Extreme compression
      language: 'dart'
    });
  }
  return compressor;
}

/**
 * Compress Dart code to COON format using the actual SDK
 */
export function compressToCoon(dartCode: string): string {
  const result = getCompressor().compress(dartCode);
  return result.compressedCode;
}

/**
 * Compress Dart code with a specific strategy
 */
export function compressToCoonWithStrategy(
  dartCode: string,
  strategy: CompressionStrategyType
): string {
  const result = getCompressor().compress(dartCode, { strategy });
  return result.compressedCode;
}

/**
 * Get compression statistics for a piece of code
 */
export function getCompressionStats(dartCode: string): {
  original: string;
  compressed: string;
  originalTokens: number;
  compressedTokens: number;
  tokenSavings: number;
  percentageSaved: number;
  strategy: CompressionStrategyType;
} {
  const result = getCompressor().compress(dartCode);
  return {
    original: dartCode,
    compressed: result.compressedCode,
    originalTokens: result.originalTokens,
    compressedTokens: result.compressedTokens,
    tokenSavings: result.tokenSavings,
    percentageSaved: result.percentageSaved,
    strategy: result.strategyUsed
  };
}

/**
 * Batch compress multiple code samples
 */
export function batchCompress(dartCodes: string[]): string[] {
  const comp = getCompressor();
  return dartCodes.map(code => comp.compress(code).compressedCode);
}

/**
 * Reset the compressor (useful for testing)
 */
export function resetCompressor(): void {
  compressor = null;
}

export { CompressionStrategyType };
