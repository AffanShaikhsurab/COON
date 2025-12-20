"""
Lexical analyzer (lexer) for Dart code.
"""

from typing import Optional

from .tokens import Token, TokenType, classify_identifier


class DartLexer:
    """
    Lexical analyzer for Dart code.

    Converts Dart source code into a stream of tokens for parsing.

    Example:
        >>> lexer = DartLexer()
        >>> tokens = lexer.tokenize("class MyWidget {}")
        >>> [t.value for t in tokens]
        ['class', 'MyWidget', '{', '}']
    """

    # Multi-character operators
    MULTI_CHAR_OPERATORS = frozenset(
        {
            "==",
            "!=",
            "<=",
            ">=",
            "&&",
            "||",
            "++",
            "--",
            "=>",
            "..",
            "??",
            "?.",
            "?..",
            "...",
            "..?",
            "+=",
            "-=",
            "*=",
            "/=",
            "%=",
            "??=",
            "&=",
            "|=",
            "^=",
            "<<=",
            ">>=",
            ">>>=",
            "~/=",
        }
    )

    # Delimiter characters
    DELIMITERS = frozenset("(){}[],.;:@")

    # Operator characters
    OPERATOR_CHARS = frozenset("+-*/%=<>!&|^~?")

    def __init__(self, include_whitespace: bool = False, include_comments: bool = True):
        """
        Initialize the lexer.

        Args:
            include_whitespace: Whether to include whitespace tokens
            include_comments: Whether to include comment tokens
        """
        self.include_whitespace = include_whitespace
        self.include_comments = include_comments
        self.tokens: list[Token] = []
        self.line = 1
        self.column = 1
        self.current_index = 0
        self.code = ""

    def tokenize(self, code: str) -> list[Token]:
        """
        Tokenize Dart code into a list of tokens.

        Args:
            code: Dart source code

        Returns:
            List of tokens
        """
        self.code = code
        self.tokens = []
        self.line = 1
        self.column = 1
        self.current_index = 0

        while self.current_index < len(code):
            # Skip whitespace
            if self._match_whitespace():
                continue

            # Skip/tokenize comments
            if self._match_comment():
                continue

            # Match string literals
            if self._match_string():
                continue

            # Match numbers
            if self._match_number():
                continue

            # Match identifiers and keywords
            if self._match_identifier():
                continue

            # Match operators and delimiters
            if self._match_operator():
                continue

            # Unknown character - skip with warning
            self._advance()

        return self.tokens

    def _current_char(self) -> Optional[str]:
        """Get current character."""
        if self.current_index < len(self.code):
            return self.code[self.current_index]
        return None

    def _peek_char(self, offset: int = 1) -> Optional[str]:
        """Peek ahead at character."""
        index = self.current_index + offset
        if index < len(self.code):
            return self.code[index]
        return None

    def _advance(self) -> str:
        """Advance to next character."""
        char = self.code[self.current_index]
        self.current_index += 1

        if char == "\n":
            self.line += 1
            self.column = 1
        else:
            self.column += 1

        return char

    def _match_whitespace(self) -> bool:
        """Match and optionally tokenize whitespace."""
        char = self._current_char()
        if char and char in " \t\n\r":
            start_line = self.line
            start_col = self.column
            value = ''
            while (current := self._current_char()) is not None and current in ' \t\n\r':
                value += self._advance()

            if self.include_whitespace:
                self.tokens.append(Token(TokenType.WHITESPACE, value, start_line, start_col))
            return True
        return False

    def _match_comment(self) -> bool:
        """Match and optionally tokenize comments."""
        # Single-line comment
        if self._current_char() == "/" and self._peek_char() == "/":
            start_line = self.line
            start_col = self.column
            value = ""
            while self._current_char() and self._current_char() != "\n":
                value += self._advance()

            if self.include_comments:
                self.tokens.append(Token(TokenType.COMMENT, value, start_line, start_col))
            return True

        # Multi-line comment
        if self._current_char() == "/" and self._peek_char() == "*":
            start_line = self.line
            start_col = self.column
            value = self._advance() + self._advance()  # /*

            while self.current_index < len(self.code) - 1:
                if self._current_char() == "*" and self._peek_char() == "/":
                    value += self._advance() + self._advance()  # */
                    break
                value += self._advance()

            if self.include_comments:
                self.tokens.append(Token(TokenType.COMMENT, value, start_line, start_col))
            return True

        return False

    def _match_string(self) -> bool:
        """Match string literals."""
        char = self._current_char()

        # Raw string
        if char == 'r' and (peek := self._peek_char()) is not None and peek in '"\'':
            start_line = self.line
            start_col = self.column
            value = self._advance()  # 'r'
            quote = self._advance()
            value += quote

            while self._current_char() and self._current_char() != quote:
                value += self._advance()

            if self._current_char() == quote:
                value += self._advance()

            self.tokens.append(Token(TokenType.LITERAL, value, start_line, start_col))
            return True

        # Triple-quoted string
        if char is not None and char in '"\'':
            if self._peek_char() == char and self._peek_char(2) == char:
                start_line = self.line
                start_col = self.column
                quote = char
                value = self._advance() + self._advance() + self._advance()  # """

                while self.current_index < len(self.code) - 2:
                    if (
                        self._current_char() == quote
                        and self._peek_char() == quote
                        and self._peek_char(2) == quote
                    ):
                        value += self._advance() + self._advance() + self._advance()
                        break
                    value += self._advance()

                self.tokens.append(Token(TokenType.LITERAL, value, start_line, start_col))
                return True

        # Single/double quoted string
        if char is not None and char in '"\'':
            start_line = self.line
            start_col = self.column
            quote = char
            value = self._advance()

            while self._current_char() and self._current_char() != quote:
                if self._current_char() == "\\":
                    value += self._advance()  # Escape character
                    if self._current_char():
                        value += self._advance()  # Escaped character
                elif self._current_char() == "\n":
                    break  # Unterminated string
                else:
                    value += self._advance()

            if self._current_char() == quote:
                value += self._advance()

            self.tokens.append(Token(TokenType.LITERAL, value, start_line, start_col))
            return True

        return False

    def _match_number(self) -> bool:
        """Match numeric literals."""
        char = self._current_char()

        # Handle hex numbers
        if char == '0' and (peek := self._peek_char()) is not None and peek in 'xX':
            start_line = self.line
            start_col = self.column
            value = self._advance() + self._advance()  # 0x

            while (curr := self._current_char()) is not None and curr in '0123456789abcdefABCDEF':
                value += self._advance()

            self.tokens.append(Token(TokenType.LITERAL, value, start_line, start_col))
            return True

        # Regular numbers
        if char and char.isdigit():
            start_line = self.line
            start_col = self.column
            value = ""

            # Integer part
            while (curr := self._current_char()) is not None and curr.isdigit():
                value += self._advance()

            # Decimal part
            curr = self._current_char()
            peek = self._peek_char()
            if curr == '.' and peek is not None and peek.isdigit():
                value += self._advance()  # .
                while (curr := self._current_char()) is not None and curr.isdigit():
                    value += self._advance()

            # Exponent part
            curr = self._current_char()
            if curr is not None and curr in 'eE':
                value += self._advance()  # e/E
                curr = self._current_char()
                if curr is not None and curr in '+-':
                    value += self._advance()  # +/-
                while (curr := self._current_char()) is not None and curr.isdigit():
                    value += self._advance()

            self.tokens.append(Token(TokenType.LITERAL, value, start_line, start_col))
            return True

        return False

    def _match_identifier(self) -> bool:
        """Match identifiers, keywords, and widgets."""
        char = self._current_char()
        if char and (char.isalpha() or char == "_" or char == "$"):
            start_line = self.line
            start_col = self.column
            value = ''

            while (curr := self._current_char()) is not None and (
                curr.isalnum() or
                curr in '_$'
            ):
                value += self._advance()

            # Classify the identifier
            token_type = classify_identifier(value)
            self.tokens.append(Token(token_type, value, start_line, start_col))
            return True

        return False

    def _match_operator(self) -> bool:
        """Match operators and delimiters."""
        char = self._current_char()
        if not char:
            return False

        start_line = self.line
        start_col = self.column

        # Try multi-character operators (longest match first)
        for length in (4, 3, 2):
            if self.current_index + length <= len(self.code):
                potential = self.code[self.current_index : self.current_index + length]
                if potential in self.MULTI_CHAR_OPERATORS:
                    for _ in range(length):
                        self._advance()
                    self.tokens.append(Token(TokenType.OPERATOR, potential, start_line, start_col))
                    return True

        # Delimiters
        if char in self.DELIMITERS:
            value = self._advance()
            self.tokens.append(Token(TokenType.DELIMITER, value, start_line, start_col))
            return True

        # Single-character operators
        if char in self.OPERATOR_CHARS:
            value = self._advance()
            self.tokens.append(Token(TokenType.OPERATOR, value, start_line, start_col))
            return True

        return False
