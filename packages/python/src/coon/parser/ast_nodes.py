"""
Abstract Syntax Tree node definitions for Dart code.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum


class NodeType(Enum):
    """Types of AST nodes."""
    ROOT = "root"
    CLASS = "class"
    FUNCTION = "function"
    METHOD = "method"
    VARIABLE = "variable"
    PARAMETER = "parameter"
    IMPORT = "import"
    EXPORT = "export"
    EXPRESSION = "expression"
    STATEMENT = "statement"
    BLOCK = "block"
    WIDGET_CALL = "widget_call"
    PROPERTY_ACCESS = "property_access"
    ARGUMENT = "argument"
    NAMED_ARGUMENT = "named_argument"
    IF_STATEMENT = "if_statement"
    FOR_STATEMENT = "for_statement"
    RETURN_STATEMENT = "return_statement"
    CONSTRUCTOR = "constructor"
    MIXIN = "mixin"
    ENUM = "enum"
    TYPEDEF = "typedef"
    LITERAL = "literal"
    IDENTIFIER = "identifier"


@dataclass
class ASTNode:
    """
    Abstract syntax tree node.
    
    Represents a node in the parsed Dart AST. Each node has a type,
    optional value, children nodes, and properties.
    
    Attributes:
        node_type: The type of this node (class, function, etc.)
        value: Primary value (e.g., class name, variable name)
        children: List of child nodes
        properties: Additional properties as key-value pairs
        line: Line number in source (1-indexed)
        column: Column number in source (1-indexed)
        
    Example:
        >>> node = ASTNode(
        ...     node_type="class",
        ...     value="MyWidget",
        ...     line=1,
        ...     column=1
        ... )
        >>> node.properties["extends"] = "StatelessWidget"
    """
    node_type: str
    value: Optional[str]
    children: List['ASTNode'] = field(default_factory=list)
    properties: Dict[str, Any] = field(default_factory=dict)
    line: int = 0
    column: int = 0
    
    def add_child(self, child: 'ASTNode'):
        """Add a child node."""
        self.children.append(child)
    
    def find_children(self, node_type: str) -> List['ASTNode']:
        """
        Find all direct children of a specific type.
        
        Args:
            node_type: The node type to search for
            
        Returns:
            List of matching child nodes
        """
        return [child for child in self.children if child.node_type == node_type]
    
    def find_descendants(self, node_type: str) -> List['ASTNode']:
        """
        Find all descendants (recursive) of a specific type.
        
        Args:
            node_type: The node type to search for
            
        Returns:
            List of matching descendant nodes
        """
        results = []
        for child in self.children:
            if child.node_type == node_type:
                results.append(child)
            results.extend(child.find_descendants(node_type))
        return results
    
    def get_property(self, key: str, default: Any = None) -> Any:
        """Get a property value with optional default."""
        return self.properties.get(key, default)
    
    def set_property(self, key: str, value: Any):
        """Set a property value."""
        self.properties[key] = value
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary representation.
        
        Returns:
            Dictionary containing all node data
        """
        return {
            'type': self.node_type,
            'value': self.value,
            'properties': self.properties,
            'children': [child.to_dict() for child in self.children],
            'line': self.line,
            'column': self.column
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ASTNode':
        """
        Create an ASTNode from a dictionary.
        
        Args:
            data: Dictionary with node data
            
        Returns:
            ASTNode instance
        """
        children = [cls.from_dict(c) for c in data.get('children', [])]
        return cls(
            node_type=data.get('type', 'unknown'),
            value=data.get('value'),
            children=children,
            properties=data.get('properties', {}),
            line=data.get('line', 0),
            column=data.get('column', 0)
        )
    
    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"ASTNode({self.node_type}, value={self.value!r}, children={len(self.children)})"


def create_root_node() -> ASTNode:
    """Create a root AST node."""
    return ASTNode(
        node_type='root',
        value=None,
        line=1,
        column=1
    )


def create_class_node(
    name: str,
    extends: Optional[str] = None,
    implements: Optional[str] = None,
    mixins: Optional[str] = None,
    line: int = 0,
    column: int = 0
) -> ASTNode:
    """
    Create a class declaration node.
    
    Args:
        name: Class name
        extends: Parent class name
        implements: List of implemented interfaces
        mixins: List of mixed-in classes
        line: Source line
        column: Source column
        
    Returns:
        ASTNode representing the class
    """
    props = {'name': name}
    if extends:
        props['extends'] = extends
    if implements:
        props['implements'] = implements
    if mixins:
        props['mixins'] = mixins
    
    return ASTNode(
        node_type='class',
        value=name,
        properties=props,
        line=line,
        column=column
    )


def create_function_node(
    name: str,
    return_type: Optional[str] = None,
    is_async: bool = False,
    line: int = 0,
    column: int = 0
) -> ASTNode:
    """
    Create a function declaration node.
    
    Args:
        name: Function name
        return_type: Return type
        is_async: Whether function is async
        line: Source line
        column: Source column
        
    Returns:
        ASTNode representing the function
    """
    props = {'name': name, 'is_async': is_async}
    if return_type:
        props['return_type'] = return_type
    
    return ASTNode(
        node_type='function',
        value=name,
        properties=props,
        line=line,
        column=column
    )


def create_variable_node(
    name: str,
    modifier: str = 'var',
    var_type: Optional[str] = None,
    line: int = 0,
    column: int = 0
) -> ASTNode:
    """
    Create a variable declaration node.
    
    Args:
        name: Variable name
        modifier: Variable modifier (final, const, var)
        var_type: Variable type
        line: Source line
        column: Source column
        
    Returns:
        ASTNode representing the variable
    """
    props = {'name': name, 'modifier': modifier}
    if var_type:
        props['type'] = var_type
    
    return ASTNode(
        node_type='variable',
        value=name,
        properties=props,
        line=line,
        column=column
    )


def create_import_node(
    path: str,
    alias: Optional[str] = None,
    show: Optional[str] = None,
    hide: Optional[str] = None,
    line: int = 0,
    column: int = 0
) -> ASTNode:
    """
    Create an import statement node.
    
    Args:
        path: Import path
        alias: Import alias (as X)
        show: Show combinators
        hide: Hide combinators
        line: Source line
        column: Source column
        
    Returns:
        ASTNode representing the import
    """
    props = {'path': path}
    if alias:
        props['alias'] = alias
    if show:
        props['show'] = show
    if hide:
        props['hide'] = hide
    
    return ASTNode(
        node_type='import',
        value=path,
        properties=props,
        line=line,
        column=column
    )
