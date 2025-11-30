"""
Advanced Dart code parser for AST-based compression
"""

import re
from dataclasses import dataclass
from typing import List, Dict, Optional, Any
from enum import Enum


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


@dataclass
class Token:
    """Represents a lexical token"""
    type: TokenType
    value: str
    line: int
    column: int
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class ASTNode:
    """Abstract syntax tree node"""
    node_type: str
    value: Optional[str]
    children: List['ASTNode']
    properties: Dict[str, Any]
    line: int
    column: int
    
    def __post_init__(self):
        if self.children is None:
            self.children = []
        if self.properties is None:
            self.properties = {}
    
    def add_child(self, child: 'ASTNode'):
        """Add a child node"""
        self.children.append(child)
    
    def find_children(self, node_type: str) -> List['ASTNode']:
        """Find all children of a specific type"""
        return [child for child in self.children if child.node_type == node_type]
    
    def to_dict(self) -> Dict:
        """Convert to dictionary representation"""
        return {
            'type': self.node_type,
            'value': self.value,
            'properties': self.properties,
            'children': [child.to_dict() for child in self.children],
            'line': self.line,
            'column': self.column
        }


class DartLexer:
    """Lexical analyzer for Dart code"""
    
    # Dart keywords
    KEYWORDS = {
        'class', 'extends', 'implements', 'with', 'mixin',
        'abstract', 'final', 'const', 'static', 'void',
        'return', 'if', 'else', 'switch', 'case', 'default',
        'for', 'while', 'do', 'break', 'continue',
        'async', 'await', 'sync', 'yield',
        'import', 'export', 'library', 'part', 'as', 'show', 'hide',
        'true', 'false', 'null',
        'new', 'this', 'super', 'is', 'as'
    }
    
    # Common Flutter widgets
    WIDGETS = {
        'Widget', 'StatelessWidget', 'StatefulWidget', 'State',
        'Scaffold', 'AppBar', 'Container', 'Column', 'Row', 
        'Text', 'Padding', 'Center', 'Align', 'SafeArea',
        'SizedBox', 'Expanded', 'Flexible', 'Stack', 'Positioned',
        'ListView', 'GridView', 'CustomScrollView', 'SingleChildScrollView',
        'TextField', 'TextFormField', 'ElevatedButton', 'TextButton',
        'IconButton', 'FloatingActionButton', 'Card', 'Divider',
        'Drawer', 'BottomNavigationBar', 'TabBar', 'TabBarView',
        'Image', 'Icon', 'CircularProgressIndicator', 'LinearProgressIndicator'
    }
    
    def __init__(self):
        self.tokens: List[Token] = []
        self.line = 1
        self.column = 1
        self.current_index = 0
        self.code = ""
    
    def tokenize(self, code: str) -> List[Token]:
        """
        Tokenize Dart code
        
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
            
            # Skip comments
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
            
            # Unknown character, skip
            self._advance()
        
        return self.tokens
    
    def _current_char(self) -> Optional[str]:
        """Get current character"""
        if self.current_index < len(self.code):
            return self.code[self.current_index]
        return None
    
    def _peek_char(self, offset: int = 1) -> Optional[str]:
        """Peek ahead at character"""
        index = self.current_index + offset
        if index < len(self.code):
            return self.code[index]
        return None
    
    def _advance(self) -> str:
        """Advance to next character"""
        char = self.code[self.current_index]
        self.current_index += 1
        
        if char == '\n':
            self.line += 1
            self.column = 1
        else:
            self.column += 1
        
        return char
    
    def _match_whitespace(self) -> bool:
        """Match and skip whitespace"""
        char = self._current_char()
        if char and char in ' \t\n\r':
            start_line = self.line
            start_col = self.column
            value = ''
            while self._current_char() and self._current_char() in ' \t\n\r':
                value += self._advance()
            # Optionally tokenize whitespace
            # self.tokens.append(Token(TokenType.WHITESPACE, value, start_line, start_col))
            return True
        return False
    
    def _match_comment(self) -> bool:
        """Match and tokenize comments"""
        if self._current_char() == '/' and self._peek_char() == '/':
            start_line = self.line
            start_col = self.column
            value = ''
            while self._current_char() and self._current_char() != '\n':
                value += self._advance()
            self.tokens.append(Token(TokenType.COMMENT, value, start_line, start_col))
            return True
        
        if self._current_char() == '/' and self._peek_char() == '*':
            start_line = self.line
            start_col = self.column
            value = ''
            self._advance()  # /
            self._advance()  # *
            value = '/*'
            
            while self.current_index < len(self.code) - 1:
                if self._current_char() == '*' and self._peek_char() == '/':
                    value += self._advance()  # *
                    value += self._advance()  # /
                    break
                value += self._advance()
            
            self.tokens.append(Token(TokenType.COMMENT, value, start_line, start_col))
            return True
        
        return False
    
    def _match_string(self) -> bool:
        """Match string literals"""
        char = self._current_char()
        if char in '"\'':
            start_line = self.line
            start_col = self.column
            quote = char
            value = self._advance()
            
            while self._current_char() and self._current_char() != quote:
                if self._current_char() == '\\':
                    value += self._advance()  # Escape character
                    if self._current_char():
                        value += self._advance()  # Escaped character
                else:
                    value += self._advance()
            
            if self._current_char() == quote:
                value += self._advance()
            
            self.tokens.append(Token(TokenType.LITERAL, value, start_line, start_col))
            return True
        
        return False
    
    def _match_number(self) -> bool:
        """Match numeric literals"""
        char = self._current_char()
        if char and char.isdigit():
            start_line = self.line
            start_col = self.column
            value = ''
            
            while self._current_char() and (self._current_char().isdigit() or self._current_char() in '._'):
                value += self._advance()
            
            self.tokens.append(Token(TokenType.LITERAL, value, start_line, start_col))
            return True
        
        return False
    
    def _match_identifier(self) -> bool:
        """Match identifiers, keywords, and widgets"""
        char = self._current_char()
        if char and (char.isalpha() or char == '_' or char == '$'):
            start_line = self.line
            start_col = self.column
            value = ''
            
            while self._current_char() and (self._current_char().isalnum() or self._current_char() in '_$'):
                value += self._advance()
            
            # Determine token type
            if value in self.KEYWORDS:
                token_type = TokenType.KEYWORD
            elif value in self.WIDGETS:
                token_type = TokenType.WIDGET
            else:
                token_type = TokenType.IDENTIFIER
            
            self.tokens.append(Token(token_type, value, start_line, start_col))
            return True
        
        return False
    
    def _match_operator(self) -> bool:
        """Match operators and delimiters"""
        char = self._current_char()
        
        # Multi-character operators
        two_char = char + (self._peek_char() or '')
        if two_char in ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '=>', '..', '??']:
            start_line = self.line
            start_col = self.column
            value = self._advance() + self._advance()
            self.tokens.append(Token(TokenType.OPERATOR, value, start_line, start_col))
            return True
        
        # Single-character operators and delimiters
        if char in '+-*/%=<>!&|^~?:;,.(){}[]@':
            start_line = self.line
            start_col = self.column
            value = self._advance()
            
            # Delimiters
            if char in '(){}[],.;:@':
                token_type = TokenType.DELIMITER
            else:
                token_type = TokenType.OPERATOR
            
            self.tokens.append(Token(token_type, value, start_line, start_col))
            return True
        
        return False


class DartParser:
    """Parse Dart code into AST"""
    
    def __init__(self):
        self.lexer = DartLexer()
        self.tokens: List[Token] = []
        self.current_index = 0
    
    def parse(self, code: str) -> ASTNode:
        """
        Parse Dart code into abstract syntax tree
        
        Args:
            code: Dart source code
            
        Returns:
            Root AST node
        """
        self.tokens = self.lexer.tokenize(code)
        self.current_index = 0
        
        root = ASTNode(
            node_type='root',
            value=None,
            children=[],
            properties={},
            line=1,
            column=1
        )
        
        while not self._is_end():
            try:
                node = self._parse_statement()
                if node:
                    root.add_child(node)
            except Exception as e:
                # Skip problematic tokens
                self._advance()
        
        return root
    
    def _current_token(self) -> Optional[Token]:
        """Get current token"""
        if self.current_index < len(self.tokens):
            return self.tokens[self.current_index]
        return None
    
    def _peek_token(self, offset: int = 1) -> Optional[Token]:
        """Peek ahead at token"""
        index = self.current_index + offset
        if index < len(self.tokens):
            return self.tokens[index]
        return None
    
    def _advance(self) -> Optional[Token]:
        """Advance to next token"""
        token = self._current_token()
        self.current_index += 1
        return token
    
    def _is_end(self) -> bool:
        """Check if at end of tokens"""
        return self.current_index >= len(self.tokens)
    
    def _parse_statement(self) -> Optional[ASTNode]:
        """Parse a statement"""
        token = self._current_token()
        if not token:
            return None
        
        # Class declaration
        if token.type == TokenType.KEYWORD and token.value == 'class':
            return self._parse_class()
        
        # Import statement
        if token.type == TokenType.KEYWORD and token.value == 'import':
            return self._parse_import()
        
        # Variable declaration
        if token.type == TokenType.KEYWORD and token.value in ['final', 'const', 'var']:
            return self._parse_variable()
        
        # Skip unknown statements
        self._advance()
        return None
    
    def _parse_class(self) -> ASTNode:
        """Parse class declaration"""
        token = self._advance()  # 'class'
        node = ASTNode(
            node_type='class',
            value=None,
            children=[],
            properties={},
            line=token.line,
            column=token.column
        )
        
        # Class name
        name_token = self._advance()
        if name_token:
            node.value = name_token.value
            node.properties['name'] = name_token.value
        
        # Extends clause
        if self._current_token() and self._current_token().value == 'extends':
            self._advance()  # 'extends'
            base_token = self._advance()
            if base_token:
                node.properties['extends'] = base_token.value
        
        # Class body
        # Simple implementation - just consume tokens until closing brace
        brace_count = 0
        while not self._is_end():
            token = self._advance()
            if token.value == '{':
                brace_count += 1
            elif token.value == '}':
                brace_count -= 1
                if brace_count == 0:
                    break
        
        return node
    
    def _parse_import(self) -> ASTNode:
        """Parse import statement"""
        token = self._advance()  # 'import'
        node = ASTNode(
            node_type='import',
            value=None,
            children=[],
            properties={},
            line=token.line,
            column=token.column
        )
        
        # Import path
        path_token = self._advance()
        if path_token and path_token.type == TokenType.LITERAL:
            node.value = path_token.value
            node.properties['path'] = path_token.value
        
        # Skip to semicolon
        while not self._is_end() and self._current_token().value != ';':
            self._advance()
        
        if not self._is_end():
            self._advance()  # ';'
        
        return node
    
    def _parse_variable(self) -> ASTNode:
        """Parse variable declaration"""
        token = self._advance()  # 'final'/'const'/'var'
        node = ASTNode(
            node_type='variable',
            value=None,
            children=[],
            properties={'modifier': token.value},
            line=token.line,
            column=token.column
        )
        
        # Type (if present)
        type_token = self._current_token()
        if type_token and type_token.type in [TokenType.IDENTIFIER, TokenType.WIDGET]:
            self._advance()
            node.properties['type'] = type_token.value
        
        # Variable name
        name_token = self._advance()
        if name_token:
            node.value = name_token.value
            node.properties['name'] = name_token.value
        
        # Skip to semicolon
        while not self._is_end() and self._current_token().value != ';':
            self._advance()
        
        if not self._is_end():
            self._advance()  # ';'
        
        return node
