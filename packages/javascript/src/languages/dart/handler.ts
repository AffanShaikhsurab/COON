/**
 * Dart/Flutter Language Handler
 *
 * Provides language-specific compression support for Dart and Flutter code.
 */

import * as fs from "fs";
import * as path from "path";
import { LanguageHandler, LanguageSpec } from "../types";
import { DartLexer } from "../../parser/lexer";
import { DartParser } from "../../parser/parser";

/**
 * Data structure for JSON files
 */
interface AbbreviationData {
  version: string;
  language?: string;
  description?: string;
  abbreviations: Record<string, string>;
}

interface SpecData {
  version: string;
  language: string;
  displayName?: string;
  framework?: string;
  extensions: string[];
  features?: Record<string, boolean>;
}

/**
 * Dart/Flutter Language Handler
 */
export class DartLanguageHandler implements LanguageHandler {
  private _spec: LanguageSpec | null = null;
  private _keywords: Record<string, string> | null = null;
  private _widgets: Record<string, string> | null = null;
  private _properties: Record<string, string> | null = null;

  /**
   * Get the language specification
   */
  get spec(): LanguageSpec {
    if (!this._spec) {
      const data = this.loadSpecData();
      this._spec = {
        name: data.language || "dart",
        version: data.version || "1.0.0",
        extensions: data.extensions || [".dart"],
        displayName: data.displayName || "Dart/Flutter",
        framework: data.framework || "flutter",
        features: data.features || {},
      };
    }
    return this._spec;
  }

  /**
   * Get the language name
   */
  get name(): string {
    return this.spec.name;
  }

  /**
   * Get path to language data directory
   */
  private getLanguageDataPath(): string {
    // Try new path first: spec/languages/dart/
    const newPath = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "..",
      "spec",
      "languages",
      "dart"
    );
    if (fs.existsSync(newPath)) {
      return newPath;
    }

    // Fallback to old path: spec/data/
    const oldPath = path.resolve(__dirname, "..", "..", "..", "..", "..", "spec", "data");
    if (fs.existsSync(oldPath)) {
      return oldPath;
    }

    throw new Error("Could not find spec data directory. " + `Tried: ${newPath} and ${oldPath}`);
  }

  /**
   * Load a JSON file from the language data directory
   */
  private loadJsonFile<T>(filename: string): T {
    const filePath = path.join(this.getLanguageDataPath(), filename);
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  }

  /**
   * Load spec.json
   */
  private loadSpecData(): SpecData {
    try {
      return this.loadJsonFile<SpecData>("spec.json");
    } catch {
      // Return defaults if spec.json doesn't exist
      return {
        version: "1.0.0",
        language: "dart",
        extensions: [".dart"],
        framework: "flutter",
      };
    }
  }

  /**
   * Get Dart keyword abbreviations
   */
  getKeywords(): Record<string, string> {
    if (!this._keywords) {
      const data = this.loadJsonFile<AbbreviationData>("keywords.json");
      this._keywords = data.abbreviations;
    }
    return this._keywords;
  }

  /**
   * Get Flutter widget abbreviations
   */
  getTypeAbbreviations(): Record<string, string> {
    if (!this._widgets) {
      const data = this.loadJsonFile<AbbreviationData>("widgets.json");
      this._widgets = data.abbreviations;
    }
    return this._widgets;
  }

  /**
   * Get Flutter property abbreviations
   */
  getPropertyAbbreviations(): Record<string, string> {
    if (!this._properties) {
      const data = this.loadJsonFile<AbbreviationData>("properties.json");
      this._properties = data.abbreviations;
    }
    return this._properties;
  }

  /**
   * Get all abbreviations combined
   */
  getAllAbbreviations(): Record<string, string> {
    return {
      ...this.getKeywords(),
      ...this.getTypeAbbreviations(),
      ...this.getPropertyAbbreviations(),
    };
  }

  /**
   * Get reverse abbreviation mapping
   */
  getReverseAbbreviations(): Record<string, string> {
    const all = this.getAllAbbreviations();
    const reverse: Record<string, string> = {};
    for (const [full, abbrev] of Object.entries(all)) {
      reverse[abbrev] = full;
    }
    return reverse;
  }

  /**
   * Get reverse abbreviations by category
   */
  getReverseAbbreviationsByCategory(): {
    widgets: Record<string, string>;
    properties: Record<string, string>;
    keywords: Record<string, string>;
  } {
    const reverseMap = (map: Record<string, string>): Record<string, string> => {
      const reverse: Record<string, string> = {};
      for (const [full, abbrev] of Object.entries(map)) {
        reverse[abbrev] = full;
      }
      return reverse;
    };

    return {
      widgets: reverseMap(this.getTypeAbbreviations()),
      properties: reverseMap(this.getPropertyAbbreviations()),
      keywords: reverseMap(this.getKeywords()),
    };
  }

  /**
   * Create a Dart lexer for the given source code
   */
  createLexer(source: string): DartLexer {
    return new DartLexer(source);
  }

  /**
   * Create a Dart parser
   */
  createParser(): DartParser {
    return new DartParser();
  }

  /**
   * Detect if code is Dart/Flutter
   */
  detectLanguage(code: string): number {
    if (!code || !code.trim()) {
      return 0;
    }

    let score = 0;

    // High confidence patterns
    const highConfidencePatterns: [RegExp, number][] = [
      [/import\s+['"]package:/g, 0.3],
      [/class\s+\w+\s+extends\s+(Stateless|Stateful)Widget/g, 0.4],
      [/Widget\s+build\s*\(\s*BuildContext/g, 0.4],
      [/@override/g, 0.15],
    ];

    // Medium confidence patterns
    const mediumConfidencePatterns: [RegExp, number][] = [
      [/\bBuildContext\b/g, 0.2],
      [/\bStatelessWidget\b/g, 0.25],
      [/\bStatefulWidget\b/g, 0.25],
      [/\bState<\w+>/g, 0.2],
      [/\bScaffold\s*\(/g, 0.2],
      [/\bContainer\s*\(/g, 0.1],
      [/\bColumn\s*\(/g, 0.1],
      [/\bRow\s*\(/g, 0.1],
    ];

    // Low confidence patterns
    const lowConfidencePatterns: [RegExp, number][] = [
      [/\bclass\s+\w+/g, 0.05],
      [/\bfinal\s+\w+/g, 0.05],
      [/\bconst\s+\w+/g, 0.05],
      [/=>/g, 0.03],
    ];

    const allPatterns = [
      ...highConfidencePatterns,
      ...mediumConfidencePatterns,
      ...lowConfidencePatterns,
    ];

    for (const [pattern, weight] of allPatterns) {
      if (pattern.test(code)) {
        score += weight;
      }
    }

    return Math.min(score, 1.0);
  }

  // Backwards compatibility aliases

  /**
   * Alias for getTypeAbbreviations()
   */
  getWidgets(): Record<string, string> {
    return this.getTypeAbbreviations();
  }

  /**
   * Alias for getPropertyAbbreviations()
   */
  getProperties(): Record<string, string> {
    return this.getPropertyAbbreviations();
  }
}
