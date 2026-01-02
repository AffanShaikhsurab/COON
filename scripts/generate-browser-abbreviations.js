#!/usr/bin/env node
/**
 * Generate browser.ts from canonical spec/data sources
 * 
 * This script ensures abbreviations in browser.ts stay synchronized with
 * the canonical spec/data/ and spec/languages/ sources, following the
 * project convention: "NEVER hardcode abbreviations - Always load from spec/data/"
 * 
 * Usage: node scripts/generate-browser-abbreviations.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const SPEC_LANGUAGES_DIR = path.resolve(__dirname, '..', 'spec', 'languages');
const OUTPUT_FILE = path.resolve(__dirname, '..', 'packages', 'javascript', 'src', 'browser.ts');

/**
 * Load JSON file
 */
function loadJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load Dart abbreviations from spec/languages/dart/
 */
function loadDartAbbreviations() {
  const dartDir = path.join(SPEC_LANGUAGES_DIR, 'dart');
  
  const widgets = loadJson(path.join(dartDir, 'widgets.json'));
  const keywords = loadJson(path.join(dartDir, 'keywords.json'));
  const properties = loadJson(path.join(dartDir, 'properties.json'));
  
  return {
    widgets: widgets.abbreviations || widgets,
    keywords: keywords.abbreviations || keywords,
    properties: properties.abbreviations || properties,
  };
}

/**
 * Load JavaScript abbreviations from spec/languages/javascript/
 */
function loadJavaScriptAbbreviations() {
  const jsDir = path.join(SPEC_LANGUAGES_DIR, 'javascript');
  
  const componentsData = loadJson(path.join(jsDir, 'components.json'));
  const keywords = loadJson(path.join(jsDir, 'keywords.json'));
  const properties = loadJson(path.join(jsDir, 'properties.json'));
  
  // Flatten components structure (react_hooks, jsx_elements, react_components)
  const components = {};
  if (componentsData.react_hooks) {
    Object.assign(components, componentsData.react_hooks);
  }
  if (componentsData.jsx_elements) {
    Object.assign(components, componentsData.jsx_elements);
  }
  if (componentsData.react_components) {
    Object.assign(components, componentsData.react_components);
  }
  
  return {
    components: components,
    keywords: keywords,
    properties: properties,
  };
}

/**
 * Generate TypeScript Record literal from abbreviations object
 */
function generateRecordLiteral(obj, indent = '  ') {
  const entries = Object.entries(obj)
    .map(([key, value]) => `${indent}${JSON.stringify(key)}: ${JSON.stringify(value)},`)
    .join('\n');
  return `{\n${entries}\n}`;
}

/**
 * Generate the complete browser.ts file
 */
function generateBrowserFile() {
  const dart = loadDartAbbreviations();
  const js = loadJavaScriptAbbreviations();
  
  const timestamp = new Date().toISOString();
  
  return `/**
 * COON Browser Module
 *
 * Browser-compatible compression implementation with embedded abbreviation data.
 * This module does NOT use Node.js fs/path APIs and can be safely bundled for browsers.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY ⚠️
 * 
 * This file is generated from canonical spec/data sources by:
 * scripts/generate-browser-abbreviations.js
 * 
 * To update abbreviations:
 * 1. Edit files in spec/languages/dart/ or spec/languages/javascript/
 * 2. Run: npm run generate:browser
 * 3. Commit both the spec changes and this generated file
 * 
 * Generated: ${timestamp}
 * 
 * @packageDocumentation
 */

// ============================================================================
// Embedded Dart/Flutter Abbreviations (from spec/languages/dart/)
// ============================================================================

export const dartWidgets: Record<string, string> = ${generateRecordLiteral(dart.widgets)};

export const dartKeywords: Record<string, string> = ${generateRecordLiteral(dart.keywords)};

export const dartProperties: Record<string, string> = ${generateRecordLiteral(dart.properties)};

// ============================================================================
// Embedded JavaScript/React Abbreviations (from spec/languages/javascript/)
// ============================================================================

export const jsKeywords: Record<string, string> = ${generateRecordLiteral(js.keywords)};

export const jsComponents: Record<string, string> = ${generateRecordLiteral(js.components)};

export const jsProperties: Record<string, string> = ${generateRecordLiteral(js.properties)};

// ============================================================================
// Types
// ============================================================================

export type Language = "dart" | "javascript";

export interface BrowserCompressionResult {
  compressedCode: string;
  originalLength: number;
  compressedLength: number;
  originalTokens: number;
  compressedTokens: number;
  tokenSavings: number;
  percentageSaved: number;
  abbreviationsUsed: string[];
}

export interface LanguageAbbreviations {
  keywords: Record<string, string>;
  widgets?: Record<string, string>;
  components?: Record<string, string>;
  properties: Record<string, string>;
}

// ============================================================================
// Browser-Compatible Compression Functions
// ============================================================================

/**
 * Get all abbreviations for a language
 */
export function getAbbreviations(language: Language): Record<string, string> {
  if (language === "dart") {
    return { ...dartKeywords, ...dartWidgets, ...dartProperties };
  }
  return { ...jsKeywords, ...jsComponents, ...jsProperties };
}

/**
 * Get abbreviations grouped by category
 */
export function getAbbreviationsByCategory(language: Language): LanguageAbbreviations {
  if (language === "dart") {
    return {
      keywords: dartKeywords,
      widgets: dartWidgets,
      properties: dartProperties,
    };
  }
  return {
    keywords: jsKeywords,
    components: jsComponents,
    properties: jsProperties,
  };
}

/**
 * Estimate token count (4 chars ≈ 1 token)
 */
function countTokens(text: string): number {
  return Math.floor(text.length / 4);
}

/**
 * Remove comments from code
 */
function removeComments(code: string): string {
  // Remove single-line comments
  let result = code.replace(/\\/\\/.*$/gm, "");
  // Remove multi-line comments
  result = result.replace(/\\/\\*[\\s\\S]*?\\*\\//g, "");
  return result;
}

/**
 * Normalize whitespace (same logic as SDK's BasicStrategy)
 */
function normalizeWhitespace(code: string): string {
  // Collapse multiple spaces to single space
  let result = code.replace(/\\s+/g, " ");
  // Remove spaces around punctuation
  result = result.replace(/ ?([:,{}[\\]()]) ?/g, "$1");
  return result.trim();
}

/**
 * Apply keyword abbreviations (same logic as SDK's CompressionStrategy)
 */
function applyKeywordAbbreviations(code: string, keywords: Record<string, string>): string {
  let result = code;
  for (const [keyword, abbrev] of Object.entries(keywords)) {
    const regex = new RegExp(\`\\\\b\${keyword}\\\\b\`, "g");
    result = result.replace(regex, abbrev);
  }
  return result;
}

/**
 * Apply widget/component abbreviations (same logic as SDK)
 */
function applyWidgetAbbreviations(code: string, widgets: Record<string, string>): string {
  let result = code;
  for (const [widget, abbrev] of Object.entries(widgets)) {
    const regex = new RegExp(\`\\\\b\${widget}\\\\b\`, "g");
    result = result.replace(regex, abbrev);
  }
  return result;
}

/**
 * Apply property abbreviations (same logic as SDK)
 */
function applyPropertyAbbreviations(code: string, properties: Record<string, string>): string {
  let result = code;
  for (const [prop, abbrev] of Object.entries(properties)) {
    // Properties include colons, so match literally
    result = result.replace(new RegExp(prop.replace(":", "\\\\:"), "g"), abbrev);
  }
  return result;
}

/**
 * Compress code using COON format (browser-compatible)
 *
 * This implements the same compression logic as the SDK's BasicStrategy
 * but without Node.js dependencies.
 */
export function compressBrowser(code: string, language: Language): BrowserCompressionResult {
  if (!code || !code.trim()) {
    return {
      compressedCode: "",
      originalLength: 0,
      compressedLength: 0,
      originalTokens: 0,
      compressedTokens: 0,
      tokenSavings: 0,
      percentageSaved: 0,
      abbreviationsUsed: [],
    };
  }

  const abbrevs = getAbbreviationsByCategory(language);
  const usedAbbreviations: string[] = [];

  // Track which abbreviations are used
  function trackAbbreviations(
    before: string,
    after: string,
    mapping: Record<string, string>
  ): void {
    for (const [full, abbrev] of Object.entries(mapping)) {
      if (before.includes(full) && after.includes(abbrev)) {
        usedAbbreviations.push(\`\${full} → \${abbrev}\`);
      }
    }
  }

  let result = code;

  // Step 1: Remove comments
  result = removeComments(result);

  // Step 2: Apply keyword abbreviations
  const beforeKeywords = result;
  result = applyKeywordAbbreviations(result, abbrevs.keywords);
  trackAbbreviations(beforeKeywords, result, abbrevs.keywords);

  // Step 3: Apply widget/component abbreviations
  const beforeWidgets = result;
  const widgetsOrComponents =
    language === "dart" ? abbrevs.widgets || {} : abbrevs.components || {};
  result = applyWidgetAbbreviations(result, widgetsOrComponents);
  trackAbbreviations(beforeWidgets, result, widgetsOrComponents);

  // Step 4: Apply property abbreviations
  const beforeProps = result;
  result = applyPropertyAbbreviations(result, abbrevs.properties);
  trackAbbreviations(beforeProps, result, abbrevs.properties);

  // Step 5: Normalize whitespace
  result = normalizeWhitespace(result);

  const originalLength = code.length;
  const compressedLength = result.length;
  const originalTokens = countTokens(code);
  const compressedTokens = countTokens(result);
  const tokenSavings = originalTokens - compressedTokens;
  const percentageSaved =
    originalLength > 0
      ? Math.round(((originalLength - compressedLength) / originalLength) * 100)
      : 0;

  return {
    compressedCode: result,
    originalLength,
    compressedLength,
    originalTokens,
    compressedTokens,
    tokenSavings,
    percentageSaved,
    abbreviationsUsed: [...new Set(usedAbbreviations)], // Remove duplicates
  };
}

/**
 * Compress Dart/Flutter code (browser-compatible)
 */
export function compressDartBrowser(code: string): BrowserCompressionResult {
  return compressBrowser(code, "dart");
}

/**
 * Compress JavaScript/React code (browser-compatible)
 */
export function compressJavaScriptBrowser(code: string): BrowserCompressionResult {
  return compressBrowser(code, "javascript");
}

// ============================================================================
// Sample Code for Testing/Demo
// ============================================================================

export const sampleDartCode = \`class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Login"),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: "Username",
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: "Password",
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {},
              child: Text("Sign In"),
            ),
          ],
        ),
      ),
    );
  }
}\`;

export const sampleReactCode = \`import { useState, useEffect } from 'react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
      </div>
      <button type="submit" disabled={!username || !password}>
        Sign In
      </button>
    </form>
  );
}\`;
`;
}

/**
 * Main execution
 */
function main() {
  console.log('Generating browser.ts from spec/data sources...');
  
  try {
    const content = generateBrowserFile();
    fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
    
    console.log(`✓ Successfully generated: ${OUTPUT_FILE}`);
    console.log('  - Loaded Dart abbreviations from spec/languages/dart/');
    console.log('  - Loaded JavaScript abbreviations from spec/languages/javascript/');
    console.log('  - Generated browser-compatible TypeScript module');
  } catch (error) {
    console.error('✗ Error generating browser.ts:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { generateBrowserFile };
