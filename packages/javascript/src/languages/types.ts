/**
 * COON Language Abstraction - Type Definitions
 *
 * Defines interfaces for language-specific handlers enabling
 * multi-language support (Dart, Python, TypeScript, etc.)
 */

import { DartLexer } from "../parser/lexer";
import { DartParser } from "../parser/parser";

/**
 * Language specification metadata
 */
export interface LanguageSpec {
  /** Language identifier (e.g., "dart", "python") */
  name: string;

  /** Specification version */
  version: string;

  /** Supported file extensions */
  extensions: string[];

  /** Display name for UI */
  displayName?: string;

  /** Associated framework (e.g., "flutter" for Dart) */
  framework?: string;

  /** Language features */
  features?: Record<string, boolean>;
}

/**
 * Abstract interface for language-specific handlers
 *
 * Each supported language must implement this interface to provide
 * language-specific compression logic.
 */
export interface LanguageHandler {
  /** Get language specification */
  readonly spec: LanguageSpec;

  /** Get language name */
  readonly name: string;

  /**
   * Get keyword abbreviations for this language
   * @returns Map of full keywords to abbreviations
   */
  getKeywords(): Record<string, string>;

  /**
   * Get type/class abbreviations
   * For Dart, these are widget abbreviations
   * For Python, these might be common module names
   */
  getTypeAbbreviations(): Record<string, string>;

  /**
   * Get property/parameter abbreviations
   */
  getPropertyAbbreviations(): Record<string, string>;

  /**
   * Get all abbreviations combined
   */
  getAllAbbreviations(): Record<string, string>;

  /**
   * Get reverse mapping (abbreviation -> full form)
   */
  getReverseAbbreviations(): Record<string, string>;

  /**
   * Get separate reverse mappings by category
   */
  getReverseAbbreviationsByCategory(): {
    widgets: Record<string, string>;
    properties: Record<string, string>;
    keywords: Record<string, string>;
  };

  /**
   * Create a lexer instance for this language
   * @param source The source code to tokenize
   */
  createLexer(source: string): DartLexer | any;

  /**
   * Create a parser instance for this language
   */
  createParser(): DartParser | any;

  /**
   * Detect if code is written in this language
   * @returns Confidence score between 0.0 and 1.0
   */
  detectLanguage(code: string): number;
}

/**
 * Helper to check if an extension matches a spec
 */
export function supportsExtension(spec: LanguageSpec, ext: string): boolean {
  const normalizedExt = ext.startsWith(".") ? ext.toLowerCase() : `.${ext}`.toLowerCase();
  return spec.extensions.some((e) => e.toLowerCase() === normalizedExt);
}

/**
 * Create a default display name from language name
 */
export function getDisplayName(spec: LanguageSpec): string {
  return spec.displayName || spec.name.charAt(0).toUpperCase() + spec.name.slice(1);
}
