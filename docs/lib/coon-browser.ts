/**
 * COON Browser Library
 * 
 * This module re-exports browser-compatible compression functions from the 
 * coon-format SDK. The compression logic is sourced directly from the SDK's
 * browser module to ensure consistency.
 * 
 * When the SDK is updated, this file automatically gets the latest version
 * since it imports from the linked package's source.
 */

// Import from SDK's browser source directly using the linked package
// Note: We import from source to avoid Node.js fs/path dependencies
import {
  // Abbreviation data
  dartWidgets,
  dartKeywords,
  dartProperties,
  jsKeywords,
  jsComponents,
  jsProperties,

  // Types
  type Language,
  type BrowserCompressionResult,
  type LanguageAbbreviations,

  // Functions
  getAbbreviations,
  getAbbreviationsByCategory,
  compressBrowser,
  compressDartBrowser,
  compressJavaScriptBrowser,

  // Sample code
  sampleDartCode,
  sampleReactCode
} from '../../packages/javascript/src/browser';

// Re-export with simpler names for convenience
export {
  dartWidgets,
  dartKeywords,
  dartProperties,
  jsKeywords,
  jsComponents,
  jsProperties,
  type Language,
  type BrowserCompressionResult,
  type LanguageAbbreviations,
  getAbbreviations,
  getAbbreviationsByCategory,
  sampleDartCode,
  sampleReactCode
};

// Convenience aliases
export const compress = compressBrowser;
export const compressDart = compressDartBrowser;
export const compressJavaScript = compressJavaScriptBrowser;
