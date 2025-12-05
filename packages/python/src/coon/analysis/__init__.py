"""
Analysis module for COON.

Provides code analysis and metrics collection for
intelligent compression strategy selection.
"""

from .analyzer import AnalysisResult, CodeAnalyzer
from .metrics import CompressionMetric, MetricsCollector

__all__ = [
    # Analyzer
    "CodeAnalyzer",
    "AnalysisResult",
    # Metrics
    "MetricsCollector",
    "CompressionMetric",
]
