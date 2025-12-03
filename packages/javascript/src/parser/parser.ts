/**
 * COON Parser - Dart Parser
 * 
 * Parses tokens into an AST.
 */

import { Token, TokenType } from './tokens';
import { DartLexer } from './lexer';
import {
    NodeType,
    ProgramNode,
    ImportNode,
    ClassDeclarationNode,
    MethodDeclarationNode,
    FieldDeclarationNode,
    ParameterNode,
    BlockNode,
    ReturnStatementNode,
    VariableDeclarationNode,
    WidgetInstantiationNode,
    FunctionCallNode,
    NamedArgumentNode,
    ListLiteralNode,
    ExpressionNode,
    StatementNode
} from './ast_nodes';

/**
 * Dart Parser
 */
export class DartParser {
    private tokens: Token[] = [];
    private pos: number = 0;

    /**
     * Parse source code to AST
     */
    parse(source: string): ProgramNode {
        const lexer = new DartLexer(source);
        this.tokens = lexer.tokenize();
        this.pos = 0;

        return this.parseProgram();
    }

    /**
     * Parse program (root)
     */
    private parseProgram(): ProgramNode {
        const imports: ImportNode[] = [];
        const declarations: (ClassDeclarationNode | FieldDeclarationNode)[] = [];

        while (!this.isAtEnd()) {
            // Skip comments
            if (this.check(TokenType.COMMENT) || this.check(TokenType.DOC_COMMENT)) {
                this.advance();
                continue;
            }

            if (this.check(TokenType.IMPORT)) {
                imports.push(this.parseImport());
            } else if (this.check(TokenType.CLASS)) {
                declarations.push(this.parseClassDeclaration());
            } else {
                // Skip unknown top-level tokens
                this.advance();
            }
        }

        return {
            type: NodeType.PROGRAM,
            line: 1,
            column: 1,
            imports,
            declarations
        };
    }

    /**
     * Parse import statement
     */
    private parseImport(): ImportNode {
        const token = this.consume(TokenType.IMPORT, 'Expected import');
        
        // Skip to string literal
        while (!this.check(TokenType.STRING) && !this.isAtEnd()) {
            this.advance();
        }

        const pathToken = this.advance();
        const path = pathToken.value.slice(1, -1); // Remove quotes

        // Skip to semicolon
        while (!this.check(TokenType.SEMICOLON) && !this.isAtEnd()) {
            this.advance();
        }
        this.match(TokenType.SEMICOLON);

        return {
            type: NodeType.IMPORT,
            line: token.line,
            column: token.column,
            path
        };
    }

    /**
     * Parse class declaration
     */
    private parseClassDeclaration(): ClassDeclarationNode {
        const token = this.consume(TokenType.CLASS, 'Expected class');
        const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected class name');
        const name = nameToken.value;

        let superclass: string | undefined;
        const interfaces: string[] = [];
        const mixins: string[] = [];

        // Parse extends, implements, with
        while (!this.check(TokenType.LBRACE) && !this.isAtEnd()) {
            if (this.match(TokenType.EXTENDS)) {
                const superToken = this.consume(TokenType.IDENTIFIER, 'Expected superclass name');
                superclass = superToken.value;
            } else if (this.check(TokenType.IDENTIFIER) && this.previous().value === 'implements') {
                const ifaceToken = this.advance();
                interfaces.push(ifaceToken.value);
            } else if (this.check(TokenType.IDENTIFIER) && this.previous().value === 'with') {
                const mixinToken = this.advance();
                mixins.push(mixinToken.value);
            } else {
                this.advance();
            }
        }

        // Parse class body
        this.consume(TokenType.LBRACE, 'Expected {');
        const members = this.parseClassBody();
        this.consume(TokenType.RBRACE, 'Expected }');

        return {
            type: NodeType.CLASS_DECLARATION,
            line: token.line,
            column: token.column,
            name,
            superclass,
            interfaces: interfaces.length > 0 ? interfaces : undefined,
            mixins: mixins.length > 0 ? mixins : undefined,
            members
        };
    }

    /**
     * Parse class body
     */
    private parseClassBody(): (MethodDeclarationNode | FieldDeclarationNode)[] {
        const members: (MethodDeclarationNode | FieldDeclarationNode)[] = [];
        let braceDepth = 1;

        while (braceDepth > 0 && !this.isAtEnd()) {
            // Skip comments
            if (this.check(TokenType.COMMENT) || this.check(TokenType.DOC_COMMENT)) {
                this.advance();
                continue;
            }

            // Track brace depth
            if (this.check(TokenType.LBRACE)) {
                braceDepth++;
                this.advance();
                continue;
            }
            if (this.check(TokenType.RBRACE)) {
                braceDepth--;
                if (braceDepth === 0) break;
                this.advance();
                continue;
            }

            // Try to parse member
            if (this.check(TokenType.OVERRIDE) || 
                this.check(TokenType.STATIC) || 
                this.check(TokenType.FINAL) ||
                this.check(TokenType.IDENTIFIER) ||
                this.check(TokenType.VOID)) {
                
                const member = this.tryParseMember();
                if (member) {
                    members.push(member);
                    continue;
                }
            }

            this.advance();
        }

        return members;
    }

    /**
     * Try to parse class member
     */
    private tryParseMember(): MethodDeclarationNode | FieldDeclarationNode | null {
        const startPos = this.pos;
        
        let isOverride = false;
        let isStatic = false;
        let isFinal = false;

        // Parse modifiers
        while (true) {
            if (this.match(TokenType.OVERRIDE)) {
                isOverride = true;
            } else if (this.match(TokenType.STATIC)) {
                isStatic = true;
            } else if (this.match(TokenType.FINAL)) {
                isFinal = true;
            } else {
                break;
            }
        }

        // Get return type or name
        if (!this.check(TokenType.IDENTIFIER) && !this.check(TokenType.VOID)) {
            this.pos = startPos;
            return null;
        }

        const firstToken = this.advance();
        
        // Check if this is a method (has parentheses) or field
        if (this.check(TokenType.IDENTIFIER)) {
            const nameToken = this.advance();
            
            if (this.check(TokenType.LPAREN)) {
                // Method
                return this.parseMethodBody(
                    nameToken.value,
                    firstToken.value,
                    isOverride,
                    isStatic,
                    firstToken
                );
            } else {
                // Field
                return this.parseFieldRest(
                    nameToken.value,
                    firstToken.value,
                    isFinal,
                    isStatic,
                    firstToken
                );
            }
        } else if (this.check(TokenType.LPAREN)) {
            // Method with inferred return type
            return this.parseMethodBody(
                firstToken.value,
                undefined,
                isOverride,
                isStatic,
                firstToken
            );
        }

        this.pos = startPos;
        return null;
    }

    /**
     * Parse method body
     */
    private parseMethodBody(
        name: string,
        returnType: string | undefined,
        isOverride: boolean,
        isStatic: boolean,
        token: Token
    ): MethodDeclarationNode {
        // Parse parameters
        this.consume(TokenType.LPAREN, 'Expected (');
        const parameters = this.parseParameters();
        this.consume(TokenType.RPAREN, 'Expected )');

        // Check for async
        const isAsync = this.match(TokenType.ASYNC);

        // Parse body or arrow
        let body: BlockNode | undefined;
        
        if (this.match(TokenType.FAT_ARROW)) {
            // Arrow function
            const expr = this.parseExpression();
            this.match(TokenType.SEMICOLON);
            body = {
                type: NodeType.BLOCK,
                line: token.line,
                column: token.column,
                statements: [{
                    type: NodeType.RETURN_STATEMENT,
                    line: token.line,
                    column: token.column,
                    value: expr
                } as ReturnStatementNode]
            };
        } else if (this.match(TokenType.LBRACE)) {
            body = this.parseBlock();
        }

        return {
            type: NodeType.METHOD_DECLARATION,
            line: token.line,
            column: token.column,
            name,
            returnType,
            parameters,
            body,
            isStatic,
            isAsync,
            isOverride,
            isGetter: false,
            isSetter: false
        };
    }

    /**
     * Parse field rest
     */
    private parseFieldRest(
        name: string,
        fieldType: string,
        isFinal: boolean,
        isStatic: boolean,
        token: Token
    ): FieldDeclarationNode {
        let initializer: ExpressionNode | undefined;

        if (this.match(TokenType.ASSIGN)) {
            initializer = this.parseExpression();
        }

        this.match(TokenType.SEMICOLON);

        return {
            type: NodeType.FIELD_DECLARATION,
            line: token.line,
            column: token.column,
            name,
            fieldType,
            initializer,
            isFinal,
            isStatic,
            isConst: false
        };
    }

    /**
     * Parse parameters
     */
    private parseParameters(): ParameterNode[] {
        const params: ParameterNode[] = [];
        let inNamed = false;

        while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
            if (this.match(TokenType.LBRACE)) {
                inNamed = true;
                continue;
            }
            if (this.match(TokenType.RBRACE)) {
                inNamed = false;
                continue;
            }
            if (this.match(TokenType.COMMA)) {
                continue;
            }

            // Parse parameter
            let paramType: string | undefined;
            let paramName: string;
            let isRequired = false;

            if (this.check(TokenType.IDENTIFIER) && this.peek()?.type === TokenType.IDENTIFIER) {
                paramType = this.advance().value;
                paramName = this.advance().value;
            } else if (this.check(TokenType.IDENTIFIER)) {
                paramName = this.advance().value;
            } else {
                this.advance();
                continue;
            }

            params.push({
                type: NodeType.PARAMETER,
                line: this.previous().line,
                column: this.previous().column,
                name: paramName,
                paramType,
                isRequired,
                isNamed: inNamed
            });
        }

        return params;
    }

    /**
     * Parse block
     */
    private parseBlock(): BlockNode {
        const statements: StatementNode[] = [];
        let depth = 1;

        while (depth > 0 && !this.isAtEnd()) {
            if (this.check(TokenType.LBRACE)) {
                depth++;
            }
            if (this.check(TokenType.RBRACE)) {
                depth--;
                if (depth === 0) {
                    this.advance();
                    break;
                }
            }

            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            } else {
                this.advance();
            }
        }

        return {
            type: NodeType.BLOCK,
            line: this.previous().line,
            column: this.previous().column,
            statements
        };
    }

    /**
     * Parse statement
     */
    private parseStatement(): StatementNode | null {
        if (this.match(TokenType.RETURN)) {
            return this.parseReturnStatement();
        }

        if (this.check(TokenType.FINAL) || this.check(TokenType.VAR) || this.check(TokenType.CONST)) {
            return this.parseVariableDeclaration();
        }

        // Expression statement
        const expr = this.parseExpression();
        if (expr) {
            this.match(TokenType.SEMICOLON);
            return {
                type: NodeType.EXPRESSION_STATEMENT,
                line: this.previous().line,
                column: this.previous().column,
                expression: expr
            };
        }

        return null;
    }

    /**
     * Parse return statement
     */
    private parseReturnStatement(): ReturnStatementNode {
        const token = this.previous();
        let value: ExpressionNode | undefined;

        if (!this.check(TokenType.SEMICOLON)) {
            value = this.parseExpression();
        }
        this.match(TokenType.SEMICOLON);

        return {
            type: NodeType.RETURN_STATEMENT,
            line: token.line,
            column: token.column,
            value
        };
    }

    /**
     * Parse variable declaration
     */
    private parseVariableDeclaration(): VariableDeclarationNode {
        const isFinal = this.match(TokenType.FINAL);
        const isConst = this.match(TokenType.CONST);
        this.match(TokenType.VAR);

        let varType: string | undefined;
        if (this.check(TokenType.IDENTIFIER) && this.peek()?.type === TokenType.IDENTIFIER) {
            varType = this.advance().value;
        }

        const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected variable name');
        let initializer: ExpressionNode | undefined;

        if (this.match(TokenType.ASSIGN)) {
            initializer = this.parseExpression();
        }

        this.match(TokenType.SEMICOLON);

        return {
            type: NodeType.VARIABLE_DECLARATION,
            line: nameToken.line,
            column: nameToken.column,
            name: nameToken.value,
            varType,
            initializer,
            isFinal,
            isConst
        };
    }

    /**
     * Parse expression
     */
    private parseExpression(): ExpressionNode {
        return this.parsePrimary();
    }

    /**
     * Parse primary expression
     */
    private parsePrimary(): ExpressionNode {
        // Literals
        if (this.check(TokenType.STRING)) {
            const token = this.advance();
            return {
                type: NodeType.LITERAL,
                line: token.line,
                column: token.column,
                value: token.value,
                literalType: 'string'
            };
        }

        if (this.check(TokenType.NUMBER)) {
            const token = this.advance();
            return {
                type: NodeType.LITERAL,
                line: token.line,
                column: token.column,
                value: parseFloat(token.value),
                literalType: 'number'
            };
        }

        if (this.check(TokenType.BOOLEAN)) {
            const token = this.advance();
            return {
                type: NodeType.LITERAL,
                line: token.line,
                column: token.column,
                value: token.value === 'true',
                literalType: 'boolean'
            };
        }

        // List literal
        if (this.match(TokenType.LBRACKET)) {
            return this.parseListLiteral();
        }

        // Identifier or function call
        if (this.check(TokenType.IDENTIFIER)) {
            const token = this.advance();
            
            // Check for function/widget call
            if (this.check(TokenType.LPAREN)) {
                return this.parseFunctionCall(token);
            }

            // Check for property access
            if (this.match(TokenType.DOT)) {
                return this.parsePropertyAccess(token);
            }

            // Check for named argument
            if (this.match(TokenType.COLON)) {
                return this.parseNamedArgument(token);
            }

            return {
                type: NodeType.IDENTIFIER,
                line: token.line,
                column: token.column,
                name: token.value
            };
        }

        // Parenthesized expression
        if (this.match(TokenType.LPAREN)) {
            const expr = this.parseExpression();
            this.consume(TokenType.RPAREN, 'Expected )');
            return expr;
        }

        // Default: return identifier placeholder
        const token = this.advance();
        return {
            type: NodeType.IDENTIFIER,
            line: token.line,
            column: token.column,
            name: token.value
        };
    }

    /**
     * Parse function call
     */
    private parseFunctionCall(nameToken: Token): WidgetInstantiationNode | FunctionCallNode {
        this.consume(TokenType.LPAREN, 'Expected (');
        const args = this.parseArguments();
        this.consume(TokenType.RPAREN, 'Expected )');

        // Check if widget (starts with uppercase)
        const isWidget = /^[A-Z]/.test(nameToken.value);

        if (isWidget) {
            return {
                type: NodeType.WIDGET_INSTANTIATION,
                line: nameToken.line,
                column: nameToken.column,
                widgetName: nameToken.value,
                arguments: args,
                isConst: false
            };
        }

        return {
            type: NodeType.FUNCTION_CALL,
            line: nameToken.line,
            column: nameToken.column,
            callee: {
                type: NodeType.IDENTIFIER,
                line: nameToken.line,
                column: nameToken.column,
                name: nameToken.value
            },
            arguments: args
        };
    }

    /**
     * Parse arguments
     */
    private parseArguments(): ExpressionNode[] {
        const args: ExpressionNode[] = [];
        let depth = 1;

        while (depth > 0 && !this.isAtEnd()) {
            if (this.check(TokenType.LPAREN) || this.check(TokenType.LBRACKET)) {
                depth++;
            }
            if (this.check(TokenType.RPAREN) || this.check(TokenType.RBRACKET)) {
                depth--;
                if (depth === 0) break;
            }

            if (this.match(TokenType.COMMA)) {
                continue;
            }

            const arg = this.parseExpression();
            args.push(arg);
        }

        return args;
    }

    /**
     * Parse property access
     */
    private parsePropertyAccess(objectToken: Token): ExpressionNode {
        const propToken = this.consume(TokenType.IDENTIFIER, 'Expected property name');
        
        let result: ExpressionNode = {
            type: NodeType.PROPERTY_ACCESS,
            line: objectToken.line,
            column: objectToken.column,
            object: {
                type: NodeType.IDENTIFIER,
                line: objectToken.line,
                column: objectToken.column,
                name: objectToken.value
            },
            property: propToken.value
        };

        // Chain property access
        while (this.match(TokenType.DOT)) {
            const nextProp = this.consume(TokenType.IDENTIFIER, 'Expected property name');
            result = {
                type: NodeType.PROPERTY_ACCESS,
                line: nextProp.line,
                column: nextProp.column,
                object: result,
                property: nextProp.value
            };
        }

        return result;
    }

    /**
     * Parse named argument
     */
    private parseNamedArgument(nameToken: Token): NamedArgumentNode {
        const value = this.parseExpression();
        
        return {
            type: NodeType.NAMED_ARGUMENT,
            line: nameToken.line,
            column: nameToken.column,
            name: nameToken.value,
            value
        };
    }

    /**
     * Parse list literal
     */
    private parseListLiteral(): ListLiteralNode {
        const elements: ExpressionNode[] = [];
        const startToken = this.previous();

        while (!this.check(TokenType.RBRACKET) && !this.isAtEnd()) {
            if (this.match(TokenType.COMMA)) continue;
            elements.push(this.parseExpression());
        }

        this.consume(TokenType.RBRACKET, 'Expected ]');

        return {
            type: NodeType.LIST_LITERAL,
            line: startToken.line,
            column: startToken.column,
            elements,
            isConst: false
        };
    }

    // Helper methods

    private isAtEnd(): boolean {
        return this.pos >= this.tokens.length || 
               this.tokens[this.pos].type === TokenType.EOF;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.tokens[this.pos].type === type;
    }

    private match(type: TokenType): boolean {
        if (this.check(type)) {
            this.advance();
            return true;
        }
        return false;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.pos++;
        return this.previous();
    }

    private previous(): Token {
        return this.tokens[this.pos - 1];
    }

    private peek(): Token | undefined {
        if (this.pos + 1 < this.tokens.length) {
            return this.tokens[this.pos + 1];
        }
        return undefined;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw new Error(`${message} at line ${this.tokens[this.pos]?.line}`);
    }
}
