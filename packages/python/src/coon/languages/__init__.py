"""
Language abstraction layer for COON.

Provides base classes and interfaces for language-specific compression handlers.
This enables support for multiple programming languages (Dart, Python, TypeScript, etc.)
"""

from .base import LanguageHandler, LanguageSpec
from .registry import LanguageRegistry

__all__ = [
    "LanguageHandler",
    "LanguageSpec",
    "LanguageRegistry",
]
