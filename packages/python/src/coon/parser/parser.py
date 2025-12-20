"""
Dart code parser - converts tokens to AST.
"""

from typing import Any, Optional

from .ast_nodes import ASTNode, create_root_node
from .lexer import DartLexer
from .tokens import Token, TokenType


class DartParser:
    """
    Parse Dart code into an Abstract Syntax Tree.

    Uses a recursive descent parsing approach to convert
    a stream of tokens into a tree structure.

    Example:
        >>> parser = DartParser()
        >>> ast = parser.parse("class MyWidget extends StatelessWidget {}")
        >>> print(ast.children[0].node_type)
        'class'
    """

    def __init__(self):
        """Initialize the parser."""
        self.lexer = DartLexer()
        self.tokens: list[Token] = []
        self.current_index = 0

    def parse(self, code: str) -> ASTNode:
        """
        Parse Dart code into an abstract syntax tree.

        Args:
            code: Dart source code

        Returns:
            Root AST node containing the parsed tree
        """
        self.tokens = self.lexer.tokenize(code)
        self.current_index = 0

        root = create_root_node()

        while not self._is_end():
            try:
                node = self._parse_statement()
                if node:
                    root.add_child(node)
            except Exception:
                # Skip problematic tokens and continue
                self._advance()

        return root

    def parse_expression(self, code: str) -> Optional[ASTNode]:
        """
        Parse a single expression.

        Args:
            code: Dart expression code

        Returns:
            AST node for the expression, or None if parsing fails
        """
        self.tokens = self.lexer.tokenize(code)
        self.current_index = 0

        return self._parse_expression()

    def _current_token(self) -> Optional[Token]:
        """Get current token."""
        if self.current_index < len(self.tokens):
            return self.tokens[self.current_index]
        return None

    def _peek_token(self, offset: int = 1) -> Optional[Token]:
        """Peek ahead at token."""
        index = self.current_index + offset
        if index < len(self.tokens):
            return self.tokens[index]
        return None

    def _advance(self) -> Optional[Token]:
        """Advance to next token."""
        token = self._current_token()
        self.current_index += 1
        return token

    def _is_end(self) -> bool:
        """Check if at end of tokens."""
        return self.current_index >= len(self.tokens)

    def _match(self, *types: TokenType) -> bool:
        """Check if current token matches any of the given types."""
        token = self._current_token()
        return token is not None and token.type in types

    def _match_value(self, value: str) -> bool:
        """Check if current token has the given value."""
        token = self._current_token()
        return token is not None and token.value == value

    def _expect(self, token_type: TokenType, value: Optional[str] = None) -> Token:
        """
        Expect current token to match and advance.

        Raises:
            SyntaxError: If token doesn't match expectations
        """
        token = self._current_token()
        if token is None:
            raise SyntaxError("Unexpected end of input")

        if token.type != token_type:
            raise SyntaxError(f"Expected {token_type}, got {token.type}")

        if value is not None and token.value != value:
            raise SyntaxError(f"Expected '{value}', got '{token.value}'")

        result = self._advance()
        assert result is not None, f"Expected token but got None after {token_type}"
        return result

    def _parse_statement(self) -> Optional[ASTNode]:
        """Parse a top-level statement."""
        token = self._current_token()
        if not token:
            return None

        # Import statement
        if token.type == TokenType.KEYWORD and token.value == "import":
            return self._parse_import()

        # Class declaration
        if token.type == TokenType.KEYWORD and token.value in ("class", "abstract"):
            return self._parse_class()

        # Mixin declaration
        if token.type == TokenType.KEYWORD and token.value == "mixin":
            return self._parse_mixin()

        # Function declaration
        if self._is_function_declaration():
            return self._parse_function()

        # Variable declaration
        if token.type == TokenType.KEYWORD and token.value in ("final", "const", "var", "late"):
            return self._parse_variable()

        # Skip unknown statements
        self._advance()
        return None

    def _is_function_declaration(self) -> bool:
        """Check if current position is a function declaration."""
        token = self._current_token()
        if not token:
            return False

        # Return type + function name + (
        if token.type in (TokenType.IDENTIFIER, TokenType.WIDGET, TokenType.KEYWORD):
            next_token = self._peek_token()
            if next_token and next_token.type == TokenType.IDENTIFIER:
                third = self._peek_token(2)
                if third and third.value == "(":
                    return True

        return False

    def _parse_import(self) -> ASTNode:
        """Parse import statement."""
        token = self._advance()  # 'import'
        assert token is not None
        node = ASTNode(
            node_type='import',
            value=None,
            line=token.line,
            column=token.column
        )

        # Import path
        path_token = self._current_token()
        if path_token and path_token.type == TokenType.LITERAL:
            self._advance()
            path = path_token.value.strip("\"'")
            node.value = path
            node.properties["path"] = path

        # as clause
        if self._match_value("as"):
            self._advance()  # 'as'
            alias_token = self._advance()
            if alias_token:
                node.properties["alias"] = alias_token.value

        # show/hide combinators
        while self._match_value('show') or self._match_value('hide'):
            combinator_token = self._advance()  # 'show' or 'hide'
            assert combinator_token is not None
            combinator = combinator_token.value
            names = []

            while True:
                name_token = self._advance()
                if name_token:
                    names.append(name_token.value)

                if not self._match_value(","):
                    break
                self._advance()  # ','

            node.properties[combinator] = names

        # Skip to semicolon
        while not self._is_end() and not self._match_value(";"):
            self._advance()

        if not self._is_end():
            self._advance()  # ';'

        return node

    def _parse_class(self) -> ASTNode:
        """Parse class declaration."""
        is_abstract = False
        if self._match_value("abstract"):
            is_abstract = True
            self._advance()

        token = self._advance()  # 'class'
        assert token is not None
        node = ASTNode(
            node_type='class',
            value=None,
            line=token.line,
            column=token.column
        )
        node.properties['is_abstract'] = is_abstract

        # Class name
        name_token = self._advance()
        if name_token:
            node.value = name_token.value
            node.properties["name"] = name_token.value

        # Type parameters
        if self._match_value("<"):
            node.properties["type_params"] = self._parse_type_parameters()

        # Extends clause
        if self._match_value("extends"):
            self._advance()
            base_token = self._advance()
            if base_token:
                node.properties["extends"] = base_token.value

            # Skip generic parameters
            if self._match_value("<"):
                self._skip_balanced("<", ">")

        # Implements clause
        if self._match_value("implements"):
            self._advance()
            interfaces = []
            while True:
                iface_token = self._advance()
                if iface_token:
                    interfaces.append(iface_token.value)

                # Skip generic parameters
                if self._match_value("<"):
                    self._skip_balanced("<", ">")

                if not self._match_value(","):
                    break
                self._advance()  # ','

            node.properties["implements"] = interfaces

        # With clause (mixins)
        if self._match_value("with"):
            self._advance()
            mixins = []
            while True:
                mixin_token = self._advance()
                if mixin_token:
                    mixins.append(mixin_token.value)

                if not self._match_value(","):
                    break
                self._advance()  # ','

            node.properties["mixins"] = mixins

        # Class body
        if self._match_value("{"):
            self._parse_class_body(node)

        return node

    def _parse_class_body(self, class_node: ASTNode):
        """Parse the body of a class."""
        self._advance()  # '{'
        brace_count = 1

        while not self._is_end() and brace_count > 0:
            token = self._current_token()
            assert token is not None

            if token.value == '{':
                brace_count += 1
                self._advance()
            elif token.value == "}":
                brace_count -= 1
                self._advance()
            else:
                # Try to parse class members
                member = self._parse_class_member()
                if member:
                    class_node.add_child(member)
                else:
                    self._advance()

    def _parse_class_member(self) -> Optional[ASTNode]:
        """Parse a class member (field or method)."""
        token = self._current_token()
        if not token:
            return None

        # Constructor
        if token.type == TokenType.IDENTIFIER:
            parent_name = self._get_current_class_name()
            if parent_name and token.value == parent_name:
                return self._parse_constructor()

        # Method or field
        if token.type == TokenType.KEYWORD and token.value in (
            "final",
            "const",
            "var",
            "late",
            "static",
        ):
            return self._parse_variable()

        # Could be a method
        if self._is_function_declaration():
            return self._parse_function()

        return None

    def _get_current_class_name(self) -> Optional[str]:
        """Get the name of the class being parsed (for constructor detection)."""
        # Look back for class name
        for i in range(self.current_index - 1, -1, -1):
            if self.tokens[i].value == "class":
                if i + 1 < len(self.tokens):
                    return self.tokens[i + 1].value
        return None

    def _parse_constructor(self) -> ASTNode:
        """Parse a constructor."""
        token = self._advance()  # Constructor name
        assert token is not None
        node = ASTNode(
            node_type="constructor", value=token.value, line=token.line, column=token.column
        )
        node.properties["name"] = token.value

        # Named constructor
        if self._match_value("."):
            self._advance()
            named_token = self._advance()
            if named_token:
                node.properties["named"] = named_token.value
                node.value = f"{token.value}.{named_token.value}"

        # Parameters
        if self._match_value("("):
            self._skip_balanced("(", ")")

        # Initializer list
        if self._match_value(":"):
            self._advance()
            while not self._is_end() and not self._match_value("{") and not self._match_value(";"):
                self._advance()

        # Body
        if self._match_value("{"):
            self._skip_balanced("{", "}")
        elif self._match_value(";"):
            self._advance()

        return node

    def _parse_mixin(self) -> ASTNode:
        """Parse mixin declaration."""
        token = self._advance()  # 'mixin'
        assert token is not None
        node = ASTNode(
            node_type='mixin',
            value=None,
            line=token.line,
            column=token.column
        )

        # Mixin name
        name_token = self._advance()
        if name_token:
            node.value = name_token.value
            node.properties["name"] = name_token.value

        # on clause
        if self._match_value("on"):
            self._advance()
            on_types = []
            while True:
                type_token = self._advance()
                if type_token:
                    on_types.append(type_token.value)

                if not self._match_value(","):
                    break
                self._advance()  # ','

            node.properties["on"] = on_types

        # Body
        if self._match_value("{"):
            self._skip_balanced("{", "}")

        return node

    def _parse_function(self) -> ASTNode:
        """Parse function declaration."""
        # Return type
        return_token = self._advance()
        assert return_token is not None
        return_type = return_token.value

        # Function name
        name_token = self._advance()

        node = ASTNode(
            node_type="function",
            value=name_token.value if name_token else None,
            line=return_token.line,
            column=return_token.column,
        )

        if name_token:
            node.properties["name"] = name_token.value
        node.properties["return_type"] = return_type

        # Generic type parameters
        if self._match_value("<"):
            node.properties["type_params"] = self._parse_type_parameters()

        # Parameters
        if self._match_value("("):
            params = self._parse_parameters()
            node.properties["parameters"] = params

        # Async/sync*
        if self._match_value("async"):
            self._advance()
            node.properties["is_async"] = True
            if self._match_value("*"):
                self._advance()
                node.properties["is_generator"] = True
        elif self._match_value("sync"):
            self._advance()
            if self._match_value("*"):
                self._advance()
                node.properties["is_sync_generator"] = True

        # Arrow function or block body
        if self._match_value("=>"):
            self._advance()
            node.properties["is_arrow"] = True
            # Skip to semicolon
            while not self._is_end() and not self._match_value(";"):
                self._advance()
            if not self._is_end():
                self._advance()  # ';'
        elif self._match_value("{"):
            self._skip_balanced("{", "}")
        elif self._match_value(";"):
            self._advance()  # Abstract method

        return node

    def _parse_parameters(self) -> list[dict]:
        """Parse function parameters."""
        params = []
        self._advance()  # '('

        while not self._is_end() and not self._match_value(')'):
            param: dict[str, Any] = {}

            # Skip modifiers like 'required'
            while self._match_value('required') or self._match_value('covariant'):
                modifier_token = self._advance()
                assert modifier_token is not None
                modifier = modifier_token.value
                param.setdefault('modifiers', []).append(modifier)

            # Type
            if self._match(TokenType.IDENTIFIER, TokenType.WIDGET, TokenType.KEYWORD):
                type_token = self._advance()
                if type_token:
                    param['type'] = type_token.value

                # Generic type
                if self._match_value("<"):
                    self._skip_balanced("<", ">")

                # Nullable
                if self._match_value("?"):
                    self._advance()
                    param["nullable"] = True

            # Name
            if self._match(TokenType.IDENTIFIER):
                name_token = self._advance()
                if name_token:
                    param['name'] = name_token.value

            # Default value
            if self._match_value("="):
                self._advance()
                # Skip to comma or )
                while (
                    not self._is_end() and not self._match_value(",") and not self._match_value(")")
                ):
                    self._advance()

            if param:
                params.append(param)

            if self._match_value(","):
                self._advance()

        if not self._is_end():
            self._advance()  # ')'

        return params

    def _parse_variable(self) -> ASTNode:
        """Parse variable declaration."""
        modifiers = []

        # Collect modifiers
        while self._match_value('final') or self._match_value('const') or \
              self._match_value('var') or self._match_value('late') or \
              self._match_value('static'):
            mod_token = self._advance()
            if mod_token:
                modifiers.append(mod_token.value)

        token = self._current_token()
        node = ASTNode(
            node_type="variable",
            value=None,
            line=token.line if token else 0,
            column=token.column if token else 0,
        )
        node.properties["modifiers"] = modifiers

        # Type (if present and not the name)
        type_token = self._current_token()
        if type_token and type_token.type in (TokenType.IDENTIFIER, TokenType.WIDGET):
            next_token = self._peek_token()
            if next_token and next_token.type == TokenType.IDENTIFIER:
                self._advance()
                node.properties["type"] = type_token.value

                # Generic type
                if self._match_value("<"):
                    self._skip_balanced("<", ">")

        # Variable name
        name_token = self._advance()
        if name_token:
            node.value = name_token.value
            node.properties["name"] = name_token.value

        # Skip to semicolon
        while not self._is_end() and not self._match_value(";"):
            self._advance()

        if not self._is_end():
            self._advance()  # ';'

        return node

    def _parse_type_parameters(self) -> list[str]:
        """Parse generic type parameters."""
        params = []
        self._advance()  # '<'

        depth = 1
        current = ""

        while not self._is_end() and depth > 0:
            token = self._advance()
            if token is None:
                break
            if token.value == '<':
                depth += 1
                current += "<"
            elif token.value == ">":
                depth -= 1
                if depth > 0:
                    current += ">"
            elif token.value == ",":
                if current.strip():
                    params.append(current.strip())
                current = ""
            else:
                current += token.value

        if current.strip():
            params.append(current.strip())

        return params

    def _parse_expression(self) -> Optional[ASTNode]:
        """Parse an expression (simplified)."""
        token = self._current_token()
        if not token:
            return None

        # Widget constructor
        if token.type == TokenType.WIDGET:
            return self._parse_widget_call()

        # Literal
        if token.type == TokenType.LITERAL:
            self._advance()
            return ASTNode(
                node_type="literal", value=token.value, line=token.line, column=token.column
            )

        # Identifier
        if token.type == TokenType.IDENTIFIER:
            self._advance()
            return ASTNode(
                node_type="identifier", value=token.value, line=token.line, column=token.column
            )

        return None

    def _parse_widget_call(self) -> ASTNode:
        """Parse a widget constructor call."""
        token = self._advance()  # Widget name
        assert token is not None
        node = ASTNode(
            node_type="widget_call", value=token.value, line=token.line, column=token.column
        )
        node.properties["widget"] = token.value

        # Arguments
        if self._match_value("("):
            self._skip_balanced("(", ")")

        return node

    def _skip_balanced(self, open_char: str, close_char: str):
        """Skip balanced delimiters."""
        if not self._match_value(open_char):
            return

        self._advance()  # opening delimiter
        depth = 1

        while not self._is_end() and depth > 0:
            token = self._advance()
            if token is None:
                break
            if token.value == open_char:
                depth += 1
            elif token.value == close_char:
                depth -= 1
