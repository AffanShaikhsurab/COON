/**
 * COON Parser - Lexer
 * 
 * Tokenizes Dart source code.
 */

import { Token, TokenType } from './tokens';

/**
 * Dart keywords mapping
 */
const KEYWORDS: Record<string, TokenType> = {
    'class': TokenType.CLASS,
    'extends': TokenType.EXTENDS,
    'implements': TokenType.IMPLEMENTS,
    'with': TokenType.WITH,
    'final': TokenType.FINAL,
    'const': TokenType.CONST,
    'var': TokenType.VAR,
    'void': TokenType.VOID,
    'return': TokenType.RETURN,
    'if': TokenType.IF,
    'else': TokenType.ELSE,
    'for': TokenType.FOR,
    'while': TokenType.WHILE,
    'do': TokenType.DO,
    'switch': TokenType.SWITCH,
    'case': TokenType.CASE,
    'default': TokenType.DEFAULT,
    'break': TokenType.BREAK,
    'continue': TokenType.CONTINUE,
    'async': TokenType.ASYNC,
    'await': TokenType.AWAIT,
    'static': TokenType.STATIC,
    'override': TokenType.OVERRIDE,
    'import': TokenType.IMPORT,
    'export': TokenType.EXPORT,
    'part': TokenType.PART,
    'library': TokenType.LIBRARY,
    'true': TokenType.BOOLEAN,
    'false': TokenType.BOOLEAN,
    'null': TokenType.NULL
};

/**
 * Dart Lexer
 */
export class DartLexer {
    private source: string;
    private pos: number = 0;
    private line: number = 1;
    private column: number = 1;
    private tokens: Token[] = [];

    constructor(source: string) {
        this.source = source;
    }

    /**
     * Tokenize the source code
     */
    tokenize(): Token[] {
        this.tokens = [];
        this.pos = 0;
        this.line = 1;
        this.column = 1;

        while (this.pos < this.source.length) {
            const token = this.nextToken();
            if (token) {
                this.tokens.push(token);
            }
        }

        // Add EOF token
        this.tokens.push(new Token(TokenType.EOF, '', this.line, this.column));

        return this.tokens;
    }

    /**
     * Get next token
     */
    private nextToken(): Token | null {
        this.skipWhitespace();

        if (this.pos >= this.source.length) {
            return null;
        }

        const char = this.source[this.pos];
        const startLine = this.line;
        const startColumn = this.column;

        // Comments
        if (char === '/' && this.peek(1) === '/') {
            return this.readLineComment(startLine, startColumn);
        }
        if (char === '/' && this.peek(1) === '*') {
            return this.readBlockComment(startLine, startColumn);
        }

        // Strings
        if (char === '"' || char === "'") {
            return this.readString(char, startLine, startColumn);
        }

        // Numbers
        if (this.isDigit(char)) {
            return this.readNumber(startLine, startColumn);
        }

        // Identifiers and keywords
        if (this.isAlpha(char) || char === '_') {
            return this.readIdentifier(startLine, startColumn);
        }

        // Multi-character operators
        const twoChar = char + (this.peek(1) || '');
        if (twoChar === '==') {
            return this.createToken(TokenType.EQUALS, '==', 2, startLine, startColumn);
        }
        if (twoChar === '!=') {
            return this.createToken(TokenType.NOT_EQUALS, '!=', 2, startLine, startColumn);
        }
        if (twoChar === '<=') {
            return this.createToken(TokenType.LESS_EQUAL, '<=', 2, startLine, startColumn);
        }
        if (twoChar === '>=') {
            return this.createToken(TokenType.GREATER_EQUAL, '>=', 2, startLine, startColumn);
        }
        if (twoChar === '&&') {
            return this.createToken(TokenType.AND, '&&', 2, startLine, startColumn);
        }
        if (twoChar === '||') {
            return this.createToken(TokenType.OR, '||', 2, startLine, startColumn);
        }
        if (twoChar === '->') {
            return this.createToken(TokenType.ARROW, '->', 2, startLine, startColumn);
        }
        if (twoChar === '=>') {
            return this.createToken(TokenType.FAT_ARROW, '=>', 2, startLine, startColumn);
        }
        if (twoChar === '..') {
            return this.createToken(TokenType.CASCADE, '..', 2, startLine, startColumn);
        }

        // Single-character tokens
        const singleCharTokens: Record<string, TokenType> = {
            '(': TokenType.LPAREN,
            ')': TokenType.RPAREN,
            '{': TokenType.LBRACE,
            '}': TokenType.RBRACE,
            '[': TokenType.LBRACKET,
            ']': TokenType.RBRACKET,
            ':': TokenType.COLON,
            ';': TokenType.SEMICOLON,
            ',': TokenType.COMMA,
            '.': TokenType.DOT,
            '=': TokenType.ASSIGN,
            '<': TokenType.LESS_THAN,
            '>': TokenType.GREATER_THAN,
            '+': TokenType.PLUS,
            '-': TokenType.MINUS,
            '*': TokenType.MULTIPLY,
            '/': TokenType.DIVIDE,
            '%': TokenType.MODULO,
            '!': TokenType.NOT,
            '?': TokenType.QUESTION
        };

        if (singleCharTokens[char]) {
            return this.createToken(singleCharTokens[char], char, 1, startLine, startColumn);
        }

        // Unknown character
        this.advance();
        return new Token(TokenType.UNKNOWN, char, startLine, startColumn);
    }

    /**
     * Skip whitespace characters
     */
    private skipWhitespace(): void {
        while (this.pos < this.source.length) {
            const char = this.source[this.pos];
            if (char === ' ' || char === '\t' || char === '\r') {
                this.advance();
            } else if (char === '\n') {
                this.advance();
                this.line++;
                this.column = 1;
            } else {
                break;
            }
        }
    }

    /**
     * Read line comment
     */
    private readLineComment(startLine: number, startColumn: number): Token {
        let value = '';
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
            value += this.source[this.pos];
            this.advance();
        }
        return new Token(TokenType.COMMENT, value, startLine, startColumn);
    }

    /**
     * Read block comment
     */
    private readBlockComment(startLine: number, startColumn: number): Token {
        let value = '';
        this.advance(); // Skip /
        this.advance(); // Skip *
        value = '/*';

        while (this.pos < this.source.length) {
            if (this.source[this.pos] === '*' && this.peek(1) === '/') {
                value += '*/';
                this.advance();
                this.advance();
                break;
            }
            if (this.source[this.pos] === '\n') {
                this.line++;
                this.column = 0;
            }
            value += this.source[this.pos];
            this.advance();
        }

        return new Token(TokenType.COMMENT, value, startLine, startColumn);
    }

    /**
     * Read string literal
     */
    private readString(quote: string, startLine: number, startColumn: number): Token {
        let value = quote;
        this.advance(); // Skip opening quote

        while (this.pos < this.source.length) {
            const char = this.source[this.pos];
            value += char;
            
            if (char === '\\' && this.peek(1)) {
                value += this.source[this.pos + 1];
                this.advance();
                this.advance();
                continue;
            }
            
            if (char === quote) {
                this.advance();
                break;
            }
            
            if (char === '\n') {
                this.line++;
                this.column = 0;
            }
            
            this.advance();
        }

        return new Token(TokenType.STRING, value, startLine, startColumn);
    }

    /**
     * Read number literal
     */
    private readNumber(startLine: number, startColumn: number): Token {
        let value = '';
        
        while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
            value += this.source[this.pos];
            this.advance();
        }

        // Check for decimal
        if (this.source[this.pos] === '.' && this.isDigit(this.peek(1) || '')) {
            value += '.';
            this.advance();
            while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
                value += this.source[this.pos];
                this.advance();
            }
        }

        return new Token(TokenType.NUMBER, value, startLine, startColumn);
    }

    /**
     * Read identifier or keyword
     */
    private readIdentifier(startLine: number, startColumn: number): Token {
        let value = '';
        
        while (this.pos < this.source.length && this.isAlphaNumeric(this.source[this.pos])) {
            value += this.source[this.pos];
            this.advance();
        }

        const type = KEYWORDS[value] || TokenType.IDENTIFIER;
        return new Token(type, value, startLine, startColumn);
    }

    /**
     * Create token and advance position
     */
    private createToken(
        type: TokenType, 
        value: string, 
        length: number,
        startLine: number,
        startColumn: number
    ): Token {
        for (let i = 0; i < length; i++) {
            this.advance();
        }
        return new Token(type, value, startLine, startColumn);
    }

    /**
     * Advance position
     */
    private advance(): void {
        this.pos++;
        this.column++;
    }

    /**
     * Peek ahead
     */
    private peek(offset: number): string | undefined {
        return this.source[this.pos + offset];
    }

    /**
     * Check if character is digit
     */
    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }

    /**
     * Check if character is alphabetic
     */
    private isAlpha(char: string): boolean {
        return (char >= 'a' && char <= 'z') || 
               (char >= 'A' && char <= 'Z') || 
               char === '_';
    }

    /**
     * Check if character is alphanumeric
     */
    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }
}
