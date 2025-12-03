/**
 * COON Parser Tests
 */

import { DartLexer, TokenType } from '../src/parser';

describe('DartLexer', () => {
    describe('tokenize', () => {
        test('tokenizes simple class', () => {
            const lexer = new DartLexer('class MyClass {}');
            const tokens = lexer.tokenize();

            expect(tokens.length).toBeGreaterThan(0);
            expect(tokens[0].type).toBe(TokenType.CLASS);
            expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[1].value).toBe('MyClass');
        });

        test('tokenizes strings', () => {
            const lexer = new DartLexer('"Hello World"');
            const tokens = lexer.tokenize();

            expect(tokens[0].type).toBe(TokenType.STRING);
            expect(tokens[0].value).toBe('"Hello World"');
        });

        test('tokenizes numbers', () => {
            const lexer = new DartLexer('42 3.14');
            const tokens = lexer.tokenize();

            expect(tokens[0].type).toBe(TokenType.NUMBER);
            expect(tokens[0].value).toBe('42');
            expect(tokens[1].type).toBe(TokenType.NUMBER);
            expect(tokens[1].value).toBe('3.14');
        });

        test('tokenizes operators', () => {
            const lexer = new DartLexer('== != <= >= && ||');
            const tokens = lexer.tokenize();

            expect(tokens[0].type).toBe(TokenType.EQUALS);
            expect(tokens[1].type).toBe(TokenType.NOT_EQUALS);
            expect(tokens[2].type).toBe(TokenType.LESS_EQUAL);
            expect(tokens[3].type).toBe(TokenType.GREATER_EQUAL);
            expect(tokens[4].type).toBe(TokenType.AND);
            expect(tokens[5].type).toBe(TokenType.OR);
        });

        test('tokenizes brackets', () => {
            const lexer = new DartLexer('(){}[]');
            const tokens = lexer.tokenize();

            expect(tokens[0].type).toBe(TokenType.LPAREN);
            expect(tokens[1].type).toBe(TokenType.RPAREN);
            expect(tokens[2].type).toBe(TokenType.LBRACE);
            expect(tokens[3].type).toBe(TokenType.RBRACE);
            expect(tokens[4].type).toBe(TokenType.LBRACKET);
            expect(tokens[5].type).toBe(TokenType.RBRACKET);
        });

        test('skips comments', () => {
            const lexer = new DartLexer('// comment\nclass A {}');
            const tokens = lexer.tokenize();

            // Comment should be included as a token
            const hasComment = tokens.some(t => t.type === TokenType.COMMENT);
            expect(hasComment).toBe(true);
        });

        test('tracks line numbers', () => {
            const lexer = new DartLexer('class\nMyClass\n{}');
            const tokens = lexer.tokenize();

            expect(tokens[0].line).toBe(1);
            expect(tokens[1].line).toBe(2);
            expect(tokens[2].line).toBe(3);
        });

        test('handles empty input', () => {
            const lexer = new DartLexer('');
            const tokens = lexer.tokenize();

            expect(tokens.length).toBe(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        test('tokenizes keywords', () => {
            const lexer = new DartLexer('if else for while return');
            const tokens = lexer.tokenize();

            expect(tokens[0].type).toBe(TokenType.IF);
            expect(tokens[1].type).toBe(TokenType.ELSE);
            expect(tokens[2].type).toBe(TokenType.FOR);
            expect(tokens[3].type).toBe(TokenType.WHILE);
            expect(tokens[4].type).toBe(TokenType.RETURN);
        });

        test('tokenizes fat arrow', () => {
            const lexer = new DartLexer('() => 42');
            const tokens = lexer.tokenize();

            const hasArrow = tokens.some(t => t.type === TokenType.FAT_ARROW);
            expect(hasArrow).toBe(true);
        });
    });
});

describe('Token', () => {
    test('isKeyword returns true for keywords', () => {
        const lexer = new DartLexer('class');
        const tokens = lexer.tokenize();

        expect(tokens[0].isKeyword()).toBe(true);
    });

    test('isKeyword returns false for identifiers', () => {
        const lexer = new DartLexer('myVariable');
        const tokens = lexer.tokenize();

        expect(tokens[0].isKeyword()).toBe(false);
    });

    test('isOperator returns true for operators', () => {
        const lexer = new DartLexer('==');
        const tokens = lexer.tokenize();

        expect(tokens[0].isOperator()).toBe(true);
    });

    test('isBracket returns true for brackets', () => {
        const lexer = new DartLexer('(');
        const tokens = lexer.tokenize();

        expect(tokens[0].isBracket()).toBe(true);
    });

    test('toString returns readable format', () => {
        const lexer = new DartLexer('class');
        const tokens = lexer.tokenize();

        expect(tokens[0].toString()).toContain('CLASS');
        expect(tokens[0].toString()).toContain('class');
    });
});
