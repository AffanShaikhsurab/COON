/**
 * COON Parser - Token Types
 */

/**
 * Token types for Dart lexer
 */
export enum TokenType {
  // Literals
  IDENTIFIER = "IDENTIFIER",
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  NULL = "NULL",

  // Keywords
  CLASS = "CLASS",
  EXTENDS = "EXTENDS",
  IMPLEMENTS = "IMPLEMENTS",
  WITH = "WITH",
  FINAL = "FINAL",
  CONST = "CONST",
  VAR = "VAR",
  VOID = "VOID",
  RETURN = "RETURN",
  IF = "IF",
  ELSE = "ELSE",
  FOR = "FOR",
  WHILE = "WHILE",
  DO = "DO",
  SWITCH = "SWITCH",
  CASE = "CASE",
  DEFAULT = "DEFAULT",
  BREAK = "BREAK",
  CONTINUE = "CONTINUE",
  ASYNC = "ASYNC",
  AWAIT = "AWAIT",
  STATIC = "STATIC",
  OVERRIDE = "OVERRIDE",
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
  PART = "PART",
  LIBRARY = "LIBRARY",

  // Operators
  ASSIGN = "ASSIGN",
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN = "GREATER_THAN",
  LESS_EQUAL = "LESS_EQUAL",
  GREATER_EQUAL = "GREATER_EQUAL",
  PLUS = "PLUS",
  MINUS = "MINUS",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
  MODULO = "MODULO",
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
  ARROW = "ARROW",
  FAT_ARROW = "FAT_ARROW",
  QUESTION = "QUESTION",
  COLON = "COLON",
  SEMICOLON = "SEMICOLON",
  COMMA = "COMMA",
  DOT = "DOT",
  CASCADE = "CASCADE",

  // Brackets
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LBRACE = "LBRACE",
  RBRACE = "RBRACE",
  LBRACKET = "LBRACKET",
  RBRACKET = "RBRACKET",

  // Comments
  COMMENT = "COMMENT",
  DOC_COMMENT = "DOC_COMMENT",

  // Special
  NEWLINE = "NEWLINE",
  WHITESPACE = "WHITESPACE",
  EOF = "EOF",
  UNKNOWN = "UNKNOWN",
}

/**
 * Token class
 */
export class Token {
  constructor(
    public type: TokenType,
    public value: string,
    public line: number,
    public column: number,
  ) {}

  toString(): string {
    return `Token(${this.type}, '${this.value}', ${this.line}:${this.column})`;
  }

  isKeyword(): boolean {
    return [
      TokenType.CLASS,
      TokenType.EXTENDS,
      TokenType.IMPLEMENTS,
      TokenType.WITH,
      TokenType.FINAL,
      TokenType.CONST,
      TokenType.VAR,
      TokenType.VOID,
      TokenType.RETURN,
      TokenType.IF,
      TokenType.ELSE,
      TokenType.FOR,
      TokenType.WHILE,
      TokenType.DO,
      TokenType.SWITCH,
      TokenType.CASE,
      TokenType.DEFAULT,
      TokenType.BREAK,
      TokenType.CONTINUE,
      TokenType.ASYNC,
      TokenType.AWAIT,
      TokenType.STATIC,
      TokenType.OVERRIDE,
      TokenType.IMPORT,
    ].includes(this.type);
  }

  isOperator(): boolean {
    return [
      TokenType.ASSIGN,
      TokenType.EQUALS,
      TokenType.NOT_EQUALS,
      TokenType.LESS_THAN,
      TokenType.GREATER_THAN,
      TokenType.LESS_EQUAL,
      TokenType.GREATER_EQUAL,
      TokenType.PLUS,
      TokenType.MINUS,
      TokenType.MULTIPLY,
      TokenType.DIVIDE,
      TokenType.MODULO,
      TokenType.AND,
      TokenType.OR,
      TokenType.NOT,
      TokenType.ARROW,
      TokenType.FAT_ARROW,
      TokenType.QUESTION,
    ].includes(this.type);
  }

  isBracket(): boolean {
    return [
      TokenType.LPAREN,
      TokenType.RPAREN,
      TokenType.LBRACE,
      TokenType.RBRACE,
      TokenType.LBRACKET,
      TokenType.RBRACKET,
    ].includes(this.type);
  }
}
