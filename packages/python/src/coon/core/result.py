"""
Result classes for compression operations.
"""

from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class CompressionResult:
    """
    Result of a compression operation.

    Attributes:
        compressed_code: The compressed COON format code
        original_tokens: Estimated token count of original code
        compressed_tokens: Estimated token count of compressed code
        compression_ratio: Ratio of tokens saved (0.0-1.0)
        strategy_used: Name of the strategy that was used
        processing_time_ms: Time taken to compress in milliseconds
        analysis_insights: Optional analysis data from code analyzer
    """

    compressed_code: str
    original_tokens: int
    compressed_tokens: int
    compression_ratio: float
    strategy_used: str
    processing_time_ms: float
    analysis_insights: Optional[dict[str, Any]] = None

    @property
    def token_savings(self) -> int:
        """Calculate the number of tokens saved."""
        return self.original_tokens - self.compressed_tokens

    @property
    def percentage_saved(self) -> float:
        """Calculate the percentage of tokens saved."""
        return self.compression_ratio * 100

    @property
    def original_size(self) -> int:
        """Alias for original_tokens for backward compatibility."""
        return self.original_tokens

    @property
    def compressed_size(self) -> int:
        """Alias for compressed_tokens for backward compatibility."""
        return self.compressed_tokens

    def to_dict(self) -> dict[str, Any]:
        """Convert result to dictionary."""
        return {
            "compressed_code": self.compressed_code,
            "original_tokens": self.original_tokens,
            "compressed_tokens": self.compressed_tokens,
            "compression_ratio": self.compression_ratio,
            "percentage_saved": self.percentage_saved,
            "token_savings": self.token_savings,
            "strategy_used": self.strategy_used,
            "processing_time_ms": self.processing_time_ms,
            "analysis_insights": self.analysis_insights,
        }


@dataclass
class DecompressionResult:
    """
    Result of a decompression operation.

    Attributes:
        decompressed_code: The decompressed Dart code
        processing_time_ms: Time taken to decompress in milliseconds
        formatted: Whether the output was formatted
    """

    decompressed_code: str
    processing_time_ms: float
    formatted: bool = True

    def to_dict(self) -> dict[str, Any]:
        """Convert result to dictionary."""
        return {
            "decompressed_code": self.decompressed_code,
            "processing_time_ms": self.processing_time_ms,
            "formatted": self.formatted,
        }
