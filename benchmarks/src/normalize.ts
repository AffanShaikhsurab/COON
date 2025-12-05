/**
 * Answer Normalization for COON Benchmarks
 * 
 * Handles type-aware answer comparison and normalization
 */

import type { AnswerType, NormalizationOptions } from './types.js';
import { WIDGET_ABBREVIATIONS } from './constants.js';

// ============================================================
// Normalization Functions
// ============================================================

/**
 * Normalize an integer answer
 */
export function normalizeInteger(value: string): number | null {
  const cleaned = value.replace(/[^\d-]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

/**
 * Normalize a number answer (including decimals)
 */
export function normalizeNumber(value: string, decimalPlaces?: number): number | null {
  const cleaned = value.replace(/[^\d.-]/g, '');
  let num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  if (decimalPlaces !== undefined) {
    num = Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  }
  return num;
}

/**
 * Normalize a string answer
 */
export function normalizeString(value: string, caseSensitive = false): string {
  let normalized = value.trim();
  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ');
  return normalized;
}

/**
 * Normalize a boolean answer
 */
export function normalizeBoolean(value: string): boolean | null {
  const lower = value.toLowerCase().trim();
  if (['yes', 'true', '1', 'y'].includes(lower)) return true;
  if (['no', 'false', '0', 'n'].includes(lower)) return false;
  return null;
}

/**
 * Normalize a widget name (handles COON abbreviations)
 */
export function normalizeWidgetName(name: string): string {
  const trimmed = name.trim();
  // Check if it's an abbreviation
  if (WIDGET_ABBREVIATIONS[trimmed]) {
    return WIDGET_ABBREVIATIONS[trimmed];
  }
  // Return as-is but normalized
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Parse a CSV list into an array
 */
export function parseCSV(value: string): string[] {
  return value
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Check if two arrays are equal (ordered)
 */
export function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => 
    normalizeString(val) === normalizeString(b[idx])
  );
}

/**
 * Check if two arrays have the same elements (unordered)
 */
export function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a.map(s => normalizeString(s)));
  const setB = new Set(b.map(s => normalizeString(s)));
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}

/**
 * Normalize widget names in a list (expands abbreviations)
 */
export function normalizeWidgetList(widgets: string[]): string[] {
  return widgets.map(w => normalizeWidgetName(w.trim()));
}

// ============================================================
// Main Comparison Function
// ============================================================

/**
 * Compare answers with type-aware normalization
 */
export function compareAnswers(
  actual: string,
  expected: string,
  answerType: AnswerType,
  options?: NormalizationOptions
): boolean {
  switch (answerType) {
    case 'integer': {
      const actualNum = normalizeInteger(actual);
      const expectedNum = normalizeInteger(expected);
      if (actualNum === null || expectedNum === null) return false;
      return actualNum === expectedNum;
    }

    case 'number': {
      const actualNum = normalizeNumber(actual, options?.decimalPlaces);
      const expectedNum = normalizeNumber(expected, options?.decimalPlaces);
      if (actualNum === null || expectedNum === null) return false;
      const tolerance = options?.tolerance ?? 0;
      return Math.abs(actualNum - expectedNum) <= tolerance;
    }

    case 'boolean': {
      const actualBool = normalizeBoolean(actual);
      const expectedBool = normalizeBoolean(expected);
      if (actualBool === null || expectedBool === null) return false;
      return actualBool === expectedBool;
    }

    case 'string': {
      const caseSensitive = options?.caseSensitive ?? false;
      return normalizeString(actual, caseSensitive) === normalizeString(expected, caseSensitive);
    }

    case 'widget-name': {
      const actualWidget = normalizeWidgetName(actual);
      const expectedWidget = normalizeWidgetName(expected);
      return actualWidget.toLowerCase() === expectedWidget.toLowerCase();
    }

    case 'csv-list-ordered': {
      const actualList = parseCSV(actual);
      const expectedList = parseCSV(expected);
      return arraysEqual(actualList, expectedList);
    }

    case 'csv-list-unordered': {
      const actualList = normalizeWidgetList(parseCSV(actual));
      const expectedList = normalizeWidgetList(parseCSV(expected));
      return setsEqual(actualList, expectedList);
    }

    default:
      // Fallback to case-insensitive string comparison
      return normalizeString(actual) === normalizeString(expected);
  }
}

// ============================================================
// Answer Extraction Helpers
// ============================================================

/**
 * Extract the answer from an LLM response
 * Handles common response patterns like "The answer is X" or just "X"
 */
export function extractAnswer(response: string, answerType: AnswerType): string {
  let cleaned = response.trim();
  
  // Remove common prefixes
  const prefixes = [
    'the answer is',
    'answer:',
    'result:',
    'output:',
    'the widgets are',
    'the widget is',
    'the value is',
    'the text is',
    'the title is',
  ];
  
  const lowerCleaned = cleaned.toLowerCase();
  for (const prefix of prefixes) {
    if (lowerCleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length).trim();
      break;
    }
  }
  
  // Remove trailing punctuation
  cleaned = cleaned.replace(/[.!?]$/, '').trim();
  
  // For boolean answers, extract YES/NO from longer responses
  if (answerType === 'boolean') {
    const lower = cleaned.toLowerCase();
    if (lower.includes('yes') || lower.includes('valid') || lower.includes('correct')) {
      return 'YES';
    }
    if (lower.includes('no') || lower.includes('invalid') || lower.includes('incorrect')) {
      return 'NO';
    }
  }
  
  // For integer answers, extract the first number found
  if (answerType === 'integer') {
    const match = cleaned.match(/\d+/);
    if (match) return match[0];
  }
  
  // For widget-name, extract capitalized words
  if (answerType === 'widget-name') {
    const match = cleaned.match(/[A-Z][a-zA-Z]*/);
    if (match) return match[0];
  }
  
  // For csv-list, clean up formatting
  if (answerType === 'csv-list-ordered' || answerType === 'csv-list-unordered') {
    // Remove brackets, quotes, and extra formatting
    cleaned = cleaned
      .replace(/[\[\]"']/g, '')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s+/g, ',');
  }
  
  return cleaned;
}

// ============================================================
// Validation Helpers
// ============================================================

/**
 * Validate COON syntax (basic check)
 */
export function isValidCoonSyntax(code: string): boolean {
  // Basic syntax checks
  const trimmed = code.trim();
  
  // Check for balanced braces
  let braceCount = 0;
  let bracketCount = 0;
  for (const char of trimmed) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
    if (braceCount < 0 || bracketCount < 0) return false;
  }
  if (braceCount !== 0 || bracketCount !== 0) return false;
  
  // Check for common patterns
  const validPatterns = [
    /^[A-Z][a-z]*\{.*\}$/s,        // Widget{...}
    /^[A-Z]'[^']*'$/,              // T'text'
    /^[A-Z]"[^"]*"$/,              // T"text"
    /^c:\w+<\w+>/,                 // c:ClassName<Parent>
    /^[A-Z][a-z]*$/,               // Single widget (no props)
  ];
  
  // For simple expressions, check against patterns
  if (!trimmed.includes(';') && !trimmed.includes('\n')) {
    const hasValidPattern = validPatterns.some(p => p.test(trimmed));
    if (!hasValidPattern && trimmed.length > 0) {
      // Additional check: should start with capital letter or c:
      if (!/^[A-Zc]/.test(trimmed)) return false;
    }
  }
  
  return true;
}

/**
 * Check if generated code contains required widgets
 */
export function containsWidgets(code: string, widgets: string[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const codeUpper = code.toUpperCase();
  
  for (const widget of widgets) {
    const widgetUpper = widget.toUpperCase();
    // Check for full name or abbreviation
    const abbrev = Object.entries(WIDGET_ABBREVIATIONS)
      .find(([_, full]) => full.toUpperCase() === widgetUpper)?.[0];
    
    result[widget] = codeUpper.includes(widgetUpper) || 
      (abbrev ? code.includes(abbrev) : false);
  }
  
  return result;
}
