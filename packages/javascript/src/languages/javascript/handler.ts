/**
 * JavaScript/React Language Handler
 *
 * Provides language-specific compression support for JavaScript and React code.
 */

import * as fs from "fs";
import * as path from "path";
import { LanguageHandler, LanguageSpec } from "../types";

/**
 * JavaScript/React Language Handler
 */
export class JavaScriptLanguageHandler implements LanguageHandler {
  private _spec: LanguageSpec | null = null;
  private _keywords: Record<string, string> | null = null;
  private _components: Record<string, Record<string, string>> | null = null;
  private _properties: Record<string, string> | null = null;

  /**
   * Get the language specification
   */
  get spec(): LanguageSpec {
    if (!this._spec) {
      this._spec = {
        name: "javascript",
        version: "1.0.0",
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        displayName: "JavaScript/React",
        framework: "react",
        features: { jsx: true, hooks: true, es6: true },
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
    const jsPath = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "..",
      "spec",
      "languages",
      "javascript"
    );
    if (fs.existsSync(jsPath)) {
      return jsPath;
    }
    throw new Error(`Could not find JavaScript spec data directory: ${jsPath}`);
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
   * Get keyword abbreviations
   */
  getKeywords(): Record<string, string> {
    if (!this._keywords) {
      this._keywords = this.loadJsonFile<Record<string, string>>("keywords.json");
    }
    return this._keywords;
  }

  /**
   * Get type abbreviations (components for JavaScript/React)
   */
  getTypeAbbreviations(): Record<string, string> {
    const components = this.getComponents();
    const combined: Record<string, string> = {};

    // Flatten all component categories
    Object.values(components).forEach((category) => {
      Object.assign(combined, category);
    });

    return combined;
  }

  /**
   * Get widget abbreviations (same as components for JavaScript)
   */
  getWidgetAbbreviations(): Record<string, string> {
    return this.getTypeAbbreviations();
  }

  /**
   * Get property abbreviations
   */
  getPropertyAbbreviations(): Record<string, string> {
    if (!this._properties) {
      this._properties = this.loadJsonFile<Record<string, string>>("properties.json");
    }
    return this._properties;
  }

  /**
   * Get components (React components and JSX elements)
   */
  private getComponents(): Record<string, Record<string, string>> {
    if (!this._components) {
      this._components =
        this.loadJsonFile<Record<string, Record<string, string>>>("components.json");
    }
    return this._components;
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
   * Get reverse mapping (abbreviation -> full form)
   */
  getReverseAbbreviations(): Record<string, string> {
    const forward = this.getAllAbbreviations();
    const reverse: Record<string, string> = {};
    Object.entries(forward).forEach(([key, value]) => {
      reverse[value] = key;
    });
    return reverse;
  }

  /**
   * Get separate reverse mappings by category
   */
  getReverseAbbreviationsByCategory(): {
    widgets: Record<string, string>;
    properties: Record<string, string>;
    keywords: Record<string, string>;
  } {
    const reverseWidgets: Record<string, string> = {};
    const reverseProperties: Record<string, string> = {};
    const reverseKeywords: Record<string, string> = {};

    Object.entries(this.getTypeAbbreviations()).forEach(([key, value]) => {
      reverseWidgets[value] = key;
    });

    Object.entries(this.getPropertyAbbreviations()).forEach(([key, value]) => {
      reverseProperties[value] = key;
    });

    Object.entries(this.getKeywords()).forEach(([key, value]) => {
      reverseKeywords[value] = key;
    });

    return {
      widgets: reverseWidgets,
      properties: reverseProperties,
      keywords: reverseKeywords,
    };
  }

  /**
   * Create a lexer instance for this language
   */
  createLexer(): any {
    // Placeholder - would use a JavaScript parser like Babel
    return null;
  }

  /**
   * Create a parser instance for this language
   */
  createParser(): any {
    // Placeholder - would use a JavaScript parser like Babel
    return null;
  }

  /**
   * Detect if code is written in JavaScript
   */
  detectLanguage(code: string): number {
    // Simple heuristics for JavaScript detection
    const jsPatterns = [
      /\bconst\b/,
      /\blet\b/,
      /\bfunction\b/,
      /=>/,
      /\bimport\b.*\bfrom\b/,
      /\bexport\b/,
      /useState|useEffect/,
    ];

    let matches = 0;
    jsPatterns.forEach((pattern) => {
      if (pattern.test(code)) matches++;
    });

    return Math.min(matches / jsPatterns.length, 1.0);
  }
}
