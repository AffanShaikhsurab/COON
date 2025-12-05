/**
 * COON Language Abstraction Module
 *
 * Provides language-agnostic interfaces for multi-language support.
 */

export {
  LanguageHandler,
  LanguageSpec,
  supportsExtension,
  getDisplayName,
} from "./types";
export { LanguageRegistry } from "./registry";
export { DartLanguageHandler } from "./dart";
