"""
Parser module for COON.

Provides lexical analysis and parsing of Dart code into an AST.
"""

from .ast_nodes import (
    ASTNode,
    NodeType,
    create_class_node,
    create_function_node,
    create_import_node,
    create_root_node,
    create_variable_node,
)
from .lexer import DartLexer
from .parser import DartParser
from .tokens import DART_KEYWORDS, FLUTTER_WIDGETS, Token, TokenType, classify_identifier

__all__ = [
    # Token classes
    "Token",
    "TokenType",
    # Token constants
    "DART_KEYWORDS",
    "FLUTTER_WIDGETS",
    "classify_identifier",
    # Lexer
    "DartLexer",
    # AST
    "ASTNode",
    "NodeType",
    "create_root_node",
    "create_class_node",
    "create_function_node",
    "create_variable_node",
    "create_import_node",
    # Parser
    "DartParser",
]
