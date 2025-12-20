"""
Base strategy interface for compression algorithms.

Defines the abstract interface that all compression strategies must implement.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, Any, Optional


@dataclass
class StrategyConfig:
    """Configuration for a compression strategy."""
    name: str
    description: str
    min_code_size: int = 0
    max_code_size: Optional[int] = None
    expected_ratio: float = 0.5
    preserve_formatting: bool = False
    preserve_comments: bool = False
    aggressive_whitespace: bool = True
    widget_abbreviation: bool = True
    property_abbreviation: bool = True
    keyword_abbreviation: bool = True
    use_ast_analysis: bool = False
    use_component_registry: bool = False
    language: str = "dart"
    parameters: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.parameters is None:
            self.parameters = {}


class CompressionStrategy(ABC):
    """
    Abstract base class for compression strategies.
    
    All compression strategies must inherit from this class and implement
    the required methods. This follows the Strategy Pattern, allowing
    different compression algorithms to be used interchangeably.
    """
    
    def __init__(self, language: str = "dart"):
        """
        Initialize the strategy with an optional language.
        
        Args:
            language: Language identifier (default: "dart")
        """
        self._language = language
        self._widgets: Optional[Dict[str, str]] = None
        self._properties: Optional[Dict[str, str]] = None
        self._keywords: Optional[Dict[str, str]] = None
    
    @property
    def language(self) -> str:
        """Get the language for this strategy."""
        return self._language
    
    def _get_abbreviations(self) -> tuple:
        """
        Get abbreviation maps from language handler or fallback to data module.
        
        Returns:
            Tuple of (widgets, properties, keywords) dictionaries
        """
        if self._widgets is None:
            # Try to use language handler first
            try:
                from ..languages import LanguageRegistry
                from ..languages.dart import DartLanguageHandler
                
                # Ensure Dart handler is registered
                if not LanguageRegistry.is_registered(self._language):
                    LanguageRegistry.register("dart", DartLanguageHandler)
                
                handler = LanguageRegistry.get(self._language)
                self._widgets = handler.get_type_abbreviations()
                self._properties = handler.get_property_abbreviations()
                self._keywords = handler.get_keywords()
            except Exception:
                # Fallback to data module
                from ..data import get_widgets, get_properties, get_keywords
                self._widgets = get_widgets()
                self._properties = get_properties()
                self._keywords = get_keywords()
        
        return self._widgets, self._properties, self._keywords
    
    @property
    @abstractmethod
    def name(self) -> str:
        """
        Get the strategy identifier name.
        
        Returns:
            String identifier for this strategy (e.g., "basic", "aggressive")
        """
        ...
    
    @property
    @abstractmethod
    def config(self) -> StrategyConfig:
        """
        Get the strategy configuration.
        
        Returns:
            StrategyConfig object with strategy settings
        """
        ...
    
    @abstractmethod
    def compress(self, code: str) -> str:
        """
        Compress Dart code to COON format.
        
        Args:
            code: Raw Dart source code
            
        Returns:
            Compressed COON format string
        """
        ...
    
    @abstractmethod
    def supports_code(self, code: str) -> bool:
        """
        Check if this strategy is suitable for the given code.
        
        Args:
            code: Dart source code to check
            
        Returns:
            True if this strategy can effectively compress the code
        """
        ...
    
    def get_expected_ratio(self) -> float:
        """
        Get the expected compression ratio for this strategy.
        
        Returns:
            Float between 0 and 1 representing expected compression ratio
        """
        return self.config.expected_ratio
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} name='{self.name}'>"


class DecompressionStrategy(ABC):
    """
    Abstract base class for decompression strategies.
    
    Handles the reverse transformation from COON format back to Dart code.
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Get the strategy identifier name."""
        ...
    
    @abstractmethod
    def decompress(self, coon_code: str) -> str:
        """
        Decompress COON format back to Dart code.
        
        Args:
            coon_code: Compressed COON format string
            
        Returns:
            Decompressed Dart source code
        """
        ...
