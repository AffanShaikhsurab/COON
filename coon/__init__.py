"""
COON: Code-Oriented Object Notation
Token-efficient compression for Dart/Flutter code
"""

__version__ = "0.2.1"
__author__ = "FlutterAI Team"
__license__ = "MIT"

from .compressor import compress_dart, decompress_coon, Compressor, CompressionResult
from .strategy import CompressionStrategy, StrategyConfig, StrategyMetrics, StrategySelector, STRATEGY_CONFIGURATIONS
from .parser import DartLexer, DartParser, Token, ASTNode, TokenType
from .analyzer import CodeAnalyzer, AnalysisResult
from .registry import Component, ComponentRegistry, create_default_registry
from .metrics import MetricsCollector, CompressionMetric
from .formatter import DartFormatter
from .validator import CompressionValidator, ValidationResult, TestCaseGenerator

__all__ = [
    # Core compression
    "compress_dart",
    "decompress_coon",
    "Compressor",
    "CompressionResult",
    
    # Strategy
    "CompressionStrategy",
    "StrategyConfig",
    "StrategyMetrics",
    "StrategySelector",
    "STRATEGY_CONFIGURATIONS",
    
    # Parser
    "DartLexer",
    "DartParser",
    "Token",
    "ASTNode",
    "TokenType",
    
    # Analyzer
    "CodeAnalyzer",
    "AnalysisResult",
    

    # Registry
    "Component",
    "ComponentRegistry",
    "create_default_registry",
    
    # Metrics
    "MetricsCollector",
    "CompressionMetric",
    
    # Formatter
    "DartFormatter",
    
    # Validator
    "CompressionValidator",
    "ValidationResult",
    "TestCaseGenerator",
]
