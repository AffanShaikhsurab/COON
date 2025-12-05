"""
Core compression and decompression module.

Provides the main Compressor and Decompressor classes along with
convenience functions for simple usage.
"""

from .compressor import Compressor, Decompressor, compress_dart, count_tokens, decompress_coon
from .config import CompressionConfig, DecompressionConfig
from .result import CompressionResult, DecompressionResult

__all__ = [
    # Main classes
    "Compressor",
    "Decompressor",
    # Configuration
    "CompressionConfig",
    "DecompressionConfig",
    # Results
    "CompressionResult",
    "DecompressionResult",
    # Convenience functions
    "compress_dart",
    "decompress_coon",
    "count_tokens",
]
