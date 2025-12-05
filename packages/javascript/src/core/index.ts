/**
 * COON Core Module
 */

// Config
export {
  CompressionConfig,
  DecompressionConfig,
  DEFAULT_COMPRESSION_CONFIG,
  DEFAULT_DECOMPRESSION_CONFIG,
  createCompressionConfig,
  createDecompressionConfig,
} from "./config";

// Result
export {
  CompressionResult,
  CompressionMetadata,
  DecompressionResult,
  createCompressionResult,
  createDecompressionResult,
} from "./result";

// Compressor
export { Compressor } from "./compressor";

// Decompressor
export { Decompressor, decompressCoon } from "./decompressor";
