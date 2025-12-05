/**
 * JavaScript SDK Backend Adapter
 * 
 * Uses the @coon-format JavaScript package for compression operations.
 */

import type { 
    BackendAdapter, 
    CompressionResult, 
    AnalysisResult, 
    ValidationResult 
} from './types.js';

// Dynamic import since @coon-format might not be installed
let sdk: any = null;

async function getSDK() {
    if (!sdk) {
        try {
            // Try npm package first
            // @ts-ignore - dynamic import
            sdk = await import('@coon-format');
        } catch {
            try {
                // Try to import from relative path (development/monorepo)
                // @ts-ignore - dynamic import
                sdk = await import('../../javascript/src/index.js');
            } catch {
                throw new Error(
                    'JavaScript SDK not found. Install it with: npm install @coon-format\n' +
                    'Or link the local package: npm link ../javascript'
                );
            }
        }
    }
    return sdk;
}

export class JSBackendAdapter implements BackendAdapter {
    readonly name = 'js';
    
    supportsLanguage(language: string): boolean {
        // Currently only supports Dart
        return language.toLowerCase() === 'dart';
    }
    
    getSupportedLanguages(): string[] {
        return ['dart'];
    }
    
    detectLanguage(code: string, filename?: string): string | null {
        // Check file extension first
        if (filename) {
            if (filename.endsWith('.dart')) return 'dart';
        }
        
        // Detect from code patterns
        const dartPatterns = [
            /class\s+\w+\s+extends\s+(Stateless|Stateful)Widget/,
            /import\s+['"]package:/,
            /Widget\s+build\s*\(\s*BuildContext/
        ];
        
        for (const pattern of dartPatterns) {
            if (pattern.test(code)) {
                return 'dart';
            }
        }
        
        return null;
    }
    
    async compress(
        code: string,
        options: {
            strategy?: string;
            language?: string;
            validate?: boolean;
            analyze?: boolean;
        }
    ): Promise<CompressionResult> {
        const { Compressor } = await getSDK();
        
        const compressor = new Compressor();
        const startTime = performance.now();
        const result = compressor.compress(code, {
            strategy: options.strategy || 'auto'
        });
        const endTime = performance.now();
        
        return {
            compressedCode: result.compressed,
            originalTokens: result.originalTokens,
            compressedTokens: result.compressedTokens,
            percentageSaved: result.percentageSaved,
            tokenSavings: result.tokensSaved,
            strategyUsed: result.strategy,
            processingTimeMs: endTime - startTime
        };
    }
    
    async decompress(
        coonCode: string,
        options: {
            language?: string;
            format?: boolean;
        }
    ): Promise<string> {
        const { Decompressor } = await getSDK();
        
        const decompressor = new Decompressor();
        const result = decompressor.decompress(coonCode);
        
        return result.decompressed;
    }
    
    async analyze(code: string, language?: string): Promise<AnalysisResult> {
        // Basic analysis - count patterns
        const lines = code.split('\n').length;
        const tokens = Math.ceil(code.length / 4); // Rough estimate
        
        // Count widgets
        const widgetPattern = /\b(Container|Column|Row|Text|Scaffold|AppBar|Center|Padding|SizedBox|Expanded|ListView|GridView|Card|Icon|Image)\b/g;
        const widgets = (code.match(widgetPattern) || []).length;
        
        // Count properties  
        const propertyPattern = /\b(child|children|padding|margin|color|style|width|height|decoration)\s*:/g;
        const properties = (code.match(propertyPattern) || []).length;
        
        const recommendations: string[] = [];
        
        if (widgets > 10) {
            recommendations.push('High widget count - aggressive strategy recommended');
        }
        if (code.includes('StatelessWidget') || code.includes('StatefulWidget')) {
            recommendations.push('Flutter widgets detected - AST-based strategy may provide better results');
        }
        if (code.length > 5000) {
            recommendations.push('Large file - consider splitting for better compression');
        }
        
        return {
            language: language || 'dart',
            lineCount: lines,
            tokenCount: tokens,
            widgetCount: widgets,
            propertyCount: properties,
            recommendations
        };
    }
    
    async validate(
        originalCode: string,
        options: {
            strategy?: string;
            language?: string;
            strict?: boolean;
        }
    ): Promise<ValidationResult> {
        const { Compressor, Decompressor } = await getSDK();
        
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Compress
        const compressor = new Compressor();
        const compressed = compressor.compress(originalCode, {
            strategy: options.strategy || 'auto'
        });
        
        // Decompress
        const decompressor = new Decompressor();
        const decompressed = decompressor.decompress(compressed.compressed);
        
        // Compare
        const normalizedOriginal = originalCode.replace(/\s+/g, ' ').trim();
        const normalizedDecompressed = decompressed.decompressed.replace(/\s+/g, ' ').trim();
        
        const reversible = normalizedOriginal === normalizedDecompressed;
        
        // Calculate similarity
        const longerLength = Math.max(normalizedOriginal.length, normalizedDecompressed.length);
        let matchingChars = 0;
        for (let i = 0; i < Math.min(normalizedOriginal.length, normalizedDecompressed.length); i++) {
            if (normalizedOriginal[i] === normalizedDecompressed[i]) {
                matchingChars++;
            }
        }
        const similarityScore = longerLength > 0 ? matchingChars / longerLength : 1;
        
        if (!reversible) {
            if (options.strict) {
                errors.push('Code is not perfectly reversible');
            } else {
                warnings.push('Minor differences in whitespace after round-trip');
            }
        }
        
        const tokenCountMatch = compressed.compressedTokens < compressed.originalTokens;
        if (!tokenCountMatch) {
            warnings.push('Compression did not reduce token count');
        }
        
        return {
            isValid: errors.length === 0,
            reversible,
            semanticEquivalent: similarityScore > 0.95,
            tokenCountMatch,
            similarityScore,
            errors,
            warnings
        };
    }
}
