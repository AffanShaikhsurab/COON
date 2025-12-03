/**
 * COON Data Module
 * 
 * Loads abbreviation data from the shared spec/ directory.
 * This is the Single Source of Truth for all abbreviations.
 * 
 * Supports both:
 * - New path: spec/languages/<language>/
 * - Legacy path: spec/data/ (for backwards compatibility)
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Data structure for abbreviation files
 */
export interface AbbreviationData {
    version: string;
    language?: string;
    description?: string;
    abbreviations: Record<string, string>;
}

/**
 * Cache for loaded data
 */
let widgetsCache: AbbreviationData | null = null;
let propertiesCache: AbbreviationData | null = null;
let keywordsCache: AbbreviationData | null = null;

/** Default language for backwards compatibility */
const DEFAULT_LANGUAGE = 'dart';

/**
 * Get the path to language-specific data directory
 * First tries spec/languages/<language>/, then falls back to spec/data/
 */
function getLanguageDataPath(language: string = DEFAULT_LANGUAGE): string {
    // Try new language-specific path first
    const newPath = path.resolve(__dirname, '..', '..', '..', '..', 'spec', 'languages', language);
    if (fs.existsSync(newPath)) {
        return newPath;
    }
    
    // Fallback to old spec/data path
    const oldPath = path.resolve(__dirname, '..', '..', '..', '..', 'spec', 'data');
    if (fs.existsSync(oldPath)) {
        return oldPath;
    }
    
    throw new Error(
        `Could not find spec data for language '${language}'. ` +
        `Tried: ${newPath} and ${oldPath}`
    );
}

/**
 * Get the path to the spec/data directory (backwards compatibility)
 */
function getDataPath(): string {
    return getLanguageDataPath(DEFAULT_LANGUAGE);
}

/**
 * Load JSON data from a file
 */
function loadJsonFile<T>(filename: string): T {
    const filePath = path.join(getDataPath(), filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Load widget abbreviations
 */
export function loadWidgets(): AbbreviationData {
    if (!widgetsCache) {
        widgetsCache = loadJsonFile<AbbreviationData>('widgets.json');
    }
    return widgetsCache;
}

/**
 * Load property abbreviations
 */
export function loadProperties(): AbbreviationData {
    if (!propertiesCache) {
        propertiesCache = loadJsonFile<AbbreviationData>('properties.json');
    }
    return propertiesCache;
}

/**
 * Load keyword abbreviations
 */
export function loadKeywords(): AbbreviationData {
    if (!keywordsCache) {
        keywordsCache = loadJsonFile<AbbreviationData>('keywords.json');
    }
    return keywordsCache;
}

/**
 * Get widget abbreviations map
 */
export function getWidgetAbbreviations(): Record<string, string> {
    return loadWidgets().abbreviations;
}

/**
 * Get property abbreviations map
 */
export function getPropertyAbbreviations(): Record<string, string> {
    return loadProperties().abbreviations;
}

/**
 * Get keyword abbreviations map
 */
export function getKeywordAbbreviations(): Record<string, string> {
    return loadKeywords().abbreviations;
}

/**
 * Get reverse mapping (abbreviation -> full name)
 */
export function getReverseWidgetMap(): Record<string, string> {
    const widgets = getWidgetAbbreviations();
    const reverse: Record<string, string> = {};
    for (const [full, abbrev] of Object.entries(widgets)) {
        reverse[abbrev] = full;
    }
    return reverse;
}

/**
 * Get reverse mapping for properties
 */
export function getReversePropertyMap(): Record<string, string> {
    const props = getPropertyAbbreviations();
    const reverse: Record<string, string> = {};
    for (const [full, abbrev] of Object.entries(props)) {
        reverse[abbrev] = full;
    }
    return reverse;
}

/**
 * Get reverse mapping for keywords
 */
export function getReverseKeywordMap(): Record<string, string> {
    const keywords = getKeywordAbbreviations();
    const reverse: Record<string, string> = {};
    for (const [full, abbrev] of Object.entries(keywords)) {
        reverse[abbrev] = full;
    }
    return reverse;
}

/**
 * Get all abbreviations as a single combined map
 */
export function getAllAbbreviations(): Record<string, string> {
    return {
        ...getWidgetAbbreviations(),
        ...getPropertyAbbreviations(),
        ...getKeywordAbbreviations()
    };
}

/**
 * Clear all caches (useful for testing)
 */
export function clearCache(): void {
    widgetsCache = null;
    propertiesCache = null;
    keywordsCache = null;
}
