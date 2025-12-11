"""
COON - Code-Oriented Object Notation

A token-efficient compression format for Dart/Flutter code,
optimized for LLM contexts. Achieves 60-70% token reduction
while maintaining semantic equivalence.

Quick Start:
    >>> from coon import compress_dart, decompress_coon
    >>>
    >>> dart_code = '''
    ... class MyWidget extends StatelessWidget {
    ...     @override
    ...     Widget build(BuildContext context) {
    ...         return Scaffold(
    ...             appBar: AppBar(title: Text('Hello')),
    ...             body: Center(child: Text('World')),
    ...         );
    ...     }
    ... }
    ... '''
    >>>
    >>> compressed = compress_dart(dart_code)
    >>> print(compressed)  # Significantly shorter
    >>>
    >>> restored = decompress_coon(compressed)
    >>> # restored is semantically equivalent to dart_code

Advanced Usage:
    >>> from coon import Compressor, CompressionConfig
    >>>
    >>> config = CompressionConfig(
    ...     strategy="aggressive",
    ...     enable_metrics=True,
    ...     validate_output=True
    ... )
    >>> compressor = Compressor(config)
    >>> result = compressor.compress(dart_code, analyze_code=True)
    >>> print(f"Saved {result.percentage_saved:.1f}% tokens")

Strategies:
    - "auto": Automatically select best strategy
    - "basic": Safe 30-40% compression
    - "aggressive": Maximum 60-70% compression
    - "ast_based": AST-aware compression
    - "component_ref": Registry-based for repeated patterns
"""

__version__ = "1.0.0"
__author__ = "COON Contributors"

# Core classes
# Analysis
from .analysis import (
    AnalysisResult,
    CodeAnalyzer,
    CompressionMetric,
    MetricsCollector,
)
from .core import (
    CompressionConfig,
    CompressionResult,
    Compressor,
    DecompressionConfig,
    DecompressionResult,
    Decompressor,
    compress_dart,
    count_tokens,
    decompress_coon,
)

# Data
from .data import (
    get_keywords,
    get_properties,
    get_widgets,
)

# Parser
from .parser import (
    ASTNode,
    DartLexer,
    DartParser,
    Token,
    TokenType,
)

# Strategies
from .strategies import (
    AggressiveStrategy,
    ASTBasedStrategy,
    BasicStrategy,
    ComponentRefStrategy,
    CompressionStrategy,
    StrategyName,
    StrategySelector,
    get_strategy,
)

# Utilities
from .utils import (
    Component,
    ComponentRegistry,
    CompressionValidator,
    DartFormatter,
    ValidationResult,
)

__all__ = [
    # Version
    "__version__",
    # Core
    "Compressor",
    "Decompressor",
    "CompressionConfig",
    "DecompressionConfig",
    "CompressionResult",
    "DecompressionResult",
    "compress_dart",
    "decompress_coon",
    "count_tokens",
    # Strategies
    "CompressionStrategy",
    "BasicStrategy",
    "AggressiveStrategy",
    "ASTBasedStrategy",
    "ComponentRefStrategy",
    "StrategySelector",
    "StrategyName",
    "get_strategy",
    # Data
    "get_widgets",
    "get_properties",
    "get_keywords",
    # Analysis
    "CodeAnalyzer",
    "AnalysisResult",
    "MetricsCollector",
    "CompressionMetric",
    # Parser
    "DartParser",
    "DartLexer",
    "Token",
    "TokenType",
    "ASTNode",
    # Utilities
    "CompressionValidator",
    "ValidationResult",
    "ComponentRegistry",
    "Component",
    "DartFormatter",
]
