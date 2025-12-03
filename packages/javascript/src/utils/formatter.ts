/**
 * COON Utils - Dart Formatter
 */

/**
 * Formatter options
 */
export interface FormatterOptions {
    indentSize: number;
    maxLineLength: number;
    insertFinalNewline: boolean;
    trimTrailingWhitespace: boolean;
}

/**
 * Default formatter options
 */
export const DEFAULT_FORMATTER_OPTIONS: FormatterOptions = {
    indentSize: 2,
    maxLineLength: 80,
    insertFinalNewline: true,
    trimTrailingWhitespace: true
};

/**
 * Dart code formatter
 */
export class DartFormatter {
    private options: FormatterOptions;

    constructor(options?: Partial<FormatterOptions>) {
        this.options = { ...DEFAULT_FORMATTER_OPTIONS, ...options };
    }

    /**
     * Format Dart code
     */
    format(code: string): string {
        let result = code;

        // Normalize line endings
        result = result.replace(/\r\n/g, '\n');

        // Format indentation
        result = this.formatIndentation(result);

        // Trim trailing whitespace
        if (this.options.trimTrailingWhitespace) {
            result = result.split('\n').map(line => line.trimEnd()).join('\n');
        }

        // Add final newline
        if (this.options.insertFinalNewline && !result.endsWith('\n')) {
            result += '\n';
        }

        return result;
    }

    /**
     * Format indentation
     */
    private formatIndentation(code: string): string {
        const lines: string[] = [];
        let depth = 0;
        const indent = ' '.repeat(this.options.indentSize);

        for (const line of code.split('\n')) {
            const trimmed = line.trim();
            
            // Decrease depth for closing braces
            if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
                depth = Math.max(0, depth - 1);
            }

            // Add indented line
            if (trimmed) {
                lines.push(indent.repeat(depth) + trimmed);
            } else {
                lines.push('');
            }

            // Increase depth for opening braces
            const openBraces = (trimmed.match(/[{(\[]/g) || []).length;
            const closeBraces = (trimmed.match(/[})\]]/g) || []).length;
            depth += openBraces - closeBraces;
            depth = Math.max(0, depth);
        }

        return lines.join('\n');
    }

    /**
     * Compact format (single line)
     */
    compact(code: string): string {
        return code
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .replace(/ ?([:,{}\[\]()]) ?/g, '$1')
            .trim();
    }

    /**
     * Pretty print with max line length
     */
    prettyPrint(code: string): string {
        let result = this.format(code);
        
        if (this.options.maxLineLength > 0) {
            result = this.wrapLines(result);
        }

        return result;
    }

    /**
     * Wrap long lines
     */
    private wrapLines(code: string): string {
        const lines: string[] = [];
        const maxLen = this.options.maxLineLength;
        const indent = ' '.repeat(this.options.indentSize);

        for (const line of code.split('\n')) {
            if (line.length <= maxLen) {
                lines.push(line);
                continue;
            }

            // Find break points
            const currentIndent = line.match(/^\s*/)?.[0] || '';
            const content = line.trim();
            
            // Try to break at commas or operators
            let remaining = content;
            let firstLine = true;

            while (remaining.length > 0) {
                const availableLen = maxLen - (firstLine ? currentIndent.length : currentIndent.length + this.options.indentSize);
                
                if (remaining.length <= availableLen) {
                    lines.push((firstLine ? currentIndent : currentIndent + indent) + remaining);
                    break;
                }

                // Find break point
                let breakPoint = remaining.lastIndexOf(',', availableLen);
                if (breakPoint === -1) {
                    breakPoint = remaining.lastIndexOf(' ', availableLen);
                }
                if (breakPoint === -1) {
                    breakPoint = availableLen;
                }

                const part = remaining.substring(0, breakPoint + 1);
                remaining = remaining.substring(breakPoint + 1).trim();
                
                lines.push((firstLine ? currentIndent : currentIndent + indent) + part);
                firstLine = false;
            }
        }

        return lines.join('\n');
    }

    /**
     * Update options
     */
    updateOptions(options: Partial<FormatterOptions>): void {
        this.options = { ...this.options, ...options };
    }

    /**
     * Get current options
     */
    getOptions(): FormatterOptions {
        return { ...this.options };
    }
}
