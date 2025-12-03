/**
 * COON Utils - Validator
 */

/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean;
    reversible: boolean;
    similarityScore: number;
    errors: string[];
    warnings: string[];
}

/**
 * Compression validator
 */
export class CompressionValidator {
    private strictMode: boolean;

    constructor(strictMode: boolean = false) {
        this.strictMode = strictMode;
    }

    /**
     * Validate compression
     */
    validateCompression(
        originalCode: string,
        compressedCode: string,
        decompressedCode: string
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check for empty results
        if (!compressedCode) {
            errors.push('Compressed code is empty');
        }
        if (!decompressedCode) {
            errors.push('Decompressed code is empty');
        }

        // Calculate similarity
        const similarityScore = this.calculateSimilarity(originalCode, decompressedCode);

        // Check reversibility
        const reversible = similarityScore > 0.8;

        if (similarityScore < 0.5) {
            errors.push(`Low similarity score: ${(similarityScore * 100).toFixed(1)}%`);
        } else if (similarityScore < 0.8) {
            warnings.push(`Moderate similarity score: ${(similarityScore * 100).toFixed(1)}%`);
        }

        // Validate compression ratio
        const ratio = compressedCode.length / originalCode.length;
        if (ratio > 1) {
            warnings.push('Compression increased size');
        }

        // Strict mode checks
        if (this.strictMode) {
            // Check for preserved identifiers
            const originalIdentifiers = this.extractIdentifiers(originalCode);
            const decompressedIdentifiers = this.extractIdentifiers(decompressedCode);
            
            const missingIdentifiers = originalIdentifiers.filter(
                id => !decompressedIdentifiers.includes(id)
            );

            if (missingIdentifiers.length > 0) {
                warnings.push(`Missing identifiers: ${missingIdentifiers.join(', ')}`);
            }
        }

        return {
            isValid: errors.length === 0,
            reversible,
            similarityScore,
            errors,
            warnings
        };
    }

    /**
     * Calculate similarity between two strings
     */
    private calculateSimilarity(original: string, decompressed: string): number {
        // Normalize strings
        const norm1 = this.normalize(original);
        const norm2 = this.normalize(decompressed);

        // Token-based comparison
        const tokens1 = new Set(norm1.split(/\s+/));
        const tokens2 = new Set(norm2.split(/\s+/));

        let matches = 0;
        for (const token of tokens1) {
            if (tokens2.has(token)) {
                matches++;
            }
        }

        const totalTokens = Math.max(tokens1.size, tokens2.size);
        return totalTokens > 0 ? matches / totalTokens : 1;
    }

    /**
     * Normalize code for comparison
     */
    private normalize(code: string): string {
        return code
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    /**
     * Extract identifiers from code
     */
    private extractIdentifiers(code: string): string[] {
        const matches = code.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
        return [...new Set(matches)];
    }
}
