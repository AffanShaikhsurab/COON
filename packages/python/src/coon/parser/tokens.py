"""
Token types and Token class for Dart lexical analysis.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any, Optional


class TokenType(Enum):
    """Dart token types"""

    KEYWORD = "keyword"
    IDENTIFIER = "identifier"
    LITERAL = "literal"
    OPERATOR = "operator"
    DELIMITER = "delimiter"
    WIDGET = "widget"
    PROPERTY = "property"
    COMMENT = "comment"
    WHITESPACE = "whitespace"
    STRING = "string"
    NUMBER = "number"


@dataclass
class Token:
    """
    Represents a lexical token.

    Attributes:
        type: The type of token (keyword, identifier, etc.)
        value: The actual string value of the token
        line: Line number where token appears (1-indexed)
        column: Column number where token appears (1-indexed)
        metadata: Optional additional metadata about the token

    Example:
        >>> token = Token(TokenType.KEYWORD, "class", line=1, column=1)
        >>> print(token)
        Token(type=<TokenType.KEYWORD: 'keyword'>, value='class', line=1, column=1)
    """

    type: TokenType
    value: str
    line: int
    column: int
    metadata: Optional[dict[str, Any]] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

    @property
    def length(self) -> int:
        """Get the length of the token value."""
        return len(self.value)

    def is_keyword(self) -> bool:
        """Check if this is a keyword token."""
        return self.type == TokenType.KEYWORD

    def is_identifier(self) -> bool:
        """Check if this is an identifier token."""
        return self.type == TokenType.IDENTIFIER

    def is_widget(self) -> bool:
        """Check if this is a widget token."""
        return self.type == TokenType.WIDGET


# Common Dart keywords
DART_KEYWORDS = frozenset(
    {
        "class",
        "extends",
        "implements",
        "with",
        "mixin",
        "abstract",
        "final",
        "const",
        "static",
        "void",
        "return",
        "if",
        "else",
        "switch",
        "case",
        "default",
        "for",
        "while",
        "do",
        "break",
        "continue",
        "async",
        "await",
        "sync",
        "yield",
        "import",
        "export",
        "library",
        "part",
        "as",
        "show",
        "hide",
        "true",
        "false",
        "null",
        "new",
        "this",
        "super",
        "is",
        "var",
        "late",
        "required",
        "enum",
        "typedef",
        "try",
        "catch",
        "finally",
        "throw",
        "rethrow",
        "get",
        "set",
        "operator",
        "external",
        "factory",
        "covariant",
        "dynamic",
        "Function",
        "Never",
        "Object",
    }
)

# Common Flutter widgets
FLUTTER_WIDGETS = frozenset(
    {
        "Widget",
        "StatelessWidget",
        "StatefulWidget",
        "State",
        "Scaffold",
        "AppBar",
        "Container",
        "Column",
        "Row",
        "Text",
        "Padding",
        "Center",
        "Align",
        "SafeArea",
        "SizedBox",
        "Expanded",
        "Flexible",
        "Stack",
        "Positioned",
        "ListView",
        "GridView",
        "CustomScrollView",
        "SingleChildScrollView",
        "TextField",
        "TextFormField",
        "ElevatedButton",
        "TextButton",
        "IconButton",
        "FloatingActionButton",
        "Card",
        "Divider",
        "Drawer",
        "BottomNavigationBar",
        "TabBar",
        "TabBarView",
        "Image",
        "Icon",
        "CircularProgressIndicator",
        "LinearProgressIndicator",
        "MaterialApp",
        "CupertinoApp",
        "Theme",
        "Builder",
        "Consumer",
        "GestureDetector",
        "InkWell",
        "Material",
        "Wrap",
        "Spacer",
        "Form",
        "FormField",
        "Checkbox",
        "Radio",
        "Switch",
        "Slider",
        "AlertDialog",
        "SimpleDialog",
        "BottomSheet",
        "SnackBar",
        "Navigator",
        "PageRouteBuilder",
        "Hero",
        "AnimatedContainer",
        "AnimatedBuilder",
        "StreamBuilder",
        "FutureBuilder",
        "ValueListenableBuilder",
    }
)


def classify_identifier(value: str) -> TokenType:
    """
    Classify an identifier string into the appropriate token type.

    Args:
        value: The identifier string to classify

    Returns:
        TokenType for the identifier
    """
    if value in DART_KEYWORDS:
        return TokenType.KEYWORD
    elif value in FLUTTER_WIDGETS:
        return TokenType.WIDGET
    else:
        return TokenType.IDENTIFIER
