"""
Configuration classes for COON compression.
"""

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class CompressionConfig:
    """
    Configuration for the COON compressor.

    Attributes:
        strategy: Default compression strategy ("auto", "basic", "aggressive", etc.)
        registry_path: Path to component registry JSON file
        enable_metrics: Whether to collect compression metrics
        metrics_storage: Path to metrics storage file
        validate_output: Whether to validate compression results
        strict_mode: If True, require perfect reversibility
        extra_options: Additional strategy-specific options
    """

    strategy: str = "auto"
    registry_path: Optional[str] = None
    enable_metrics: bool = False
    metrics_storage: Optional[str] = None
    validate_output: bool = False
    strict_mode: bool = False
    extra_options: dict[str, Any] = field(default_factory=dict)


@dataclass
class DecompressionConfig:
    """
    Configuration for the COON decompressor.

    Attributes:
        format_output: Whether to format decompressed code
        indent_spaces: Number of spaces per indentation level
        preserve_comments: Whether to preserve comments
    """

    format_output: bool = True
    indent_spaces: int = 2
    preserve_comments: bool = True
