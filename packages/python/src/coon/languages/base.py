"""
Abstract base class for language handlers.

Defines the interface that all language-specific compression handlers must implement.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any, Optional

if TYPE_CHECKING:
    pass


@dataclass
class LanguageSpec:
    """
    Language specification metadata.

    Contains information about a supported programming language
    including its name, version, file extensions, and capabilities.
    """

    name: str
    version: str
    extensions: list[str]
    display_name: Optional[str] = None
    framework: Optional[str] = None
    features: dict[str, bool] = field(default_factory=dict)

    def __post_init__(self):
        if self.display_name is None:
            self.display_name = self.name.title()

    def supports_extension(self, ext: str) -> bool:
        """Check if this language supports the given file extension."""
        ext = ext if ext.startswith(".") else f".{ext}"
        return ext.lower() in [e.lower() for e in self.extensions]


class LanguageHandler(ABC):
    """
    Abstract base class for language-specific compression handlers.

    Each supported language (Dart, Python, TypeScript, etc.) must implement
    this interface to provide language-specific compression logic.

    Example:
        >>> class DartHandler(LanguageHandler):
        ...     @property
        ...     def spec(self) -> LanguageSpec:
        ...         return LanguageSpec(name="dart", version="1.0.0", extensions=[".dart"])
        ...     # ... implement other methods
    """

    @property
    @abstractmethod
    def spec(self) -> LanguageSpec:
        """
        Get the language specification.

        Returns:
            LanguageSpec containing language metadata.
        """
        pass

    @property
    def name(self) -> str:
        """Get the language name."""
        return self.spec.name

    @abstractmethod
    def get_keywords(self) -> dict[str, str]:
        """
        Get keyword abbreviations for this language.

        Returns:
            Dictionary mapping full keywords to their abbreviations.
            Example: {"class": "c:", "return": "ret"}
        """
        pass

    @abstractmethod
    def get_type_abbreviations(self) -> dict[str, str]:
        """
        Get type/class abbreviations for this language.

        For Dart/Flutter, these are widget abbreviations.
        For Python, these might be common module/class abbreviations.

        Returns:
            Dictionary mapping type names to their abbreviations.
            Example: {"Scaffold": "S", "Container": "K"}
        """
        pass

    @abstractmethod
    def get_property_abbreviations(self) -> dict[str, str]:
        """
        Get property/parameter abbreviations for this language.

        Returns:
            Dictionary mapping property names to their abbreviations.
            Example: {"child:": "c:", "children:": "h:"}
        """
        pass

    @abstractmethod
    def create_lexer(self) -> Any:
        """
        Create a lexer instance for this language.

        Returns:
            A lexer capable of tokenizing this language's source code.
        """
        pass

    @abstractmethod
    def create_parser(self) -> Any:
        """
        Create a parser instance for this language.

        Returns:
            A parser capable of parsing this language's source code.
        """
        pass

    @abstractmethod
    def detect_language(self, code: str) -> float:
        """
        Detect if code is written in this language.

        Args:
            code: Source code to analyze.

        Returns:
            Confidence score between 0.0 and 1.0.
            Higher scores indicate higher confidence that the code
            is written in this language.
        """
        pass

    def get_all_abbreviations(self) -> dict[str, str]:
        """
        Get all abbreviations combined.

        Returns:
            Dictionary containing all abbreviations (keywords + types + properties).
        """
        result = {}
        result.update(self.get_keywords())
        result.update(self.get_type_abbreviations())
        result.update(self.get_property_abbreviations())
        return result

    def get_reverse_abbreviations(self) -> dict[str, str]:
        """
        Get reverse mapping (abbreviation -> full form).

        Useful for decompression.

        Returns:
            Dictionary mapping abbreviations back to their full forms.
        """
        return {v: k for k, v in self.get_all_abbreviations().items()}

    def get_reverse_abbreviations_by_category(self) -> dict[str, dict[str, str]]:
        """
        Get reverse abbreviation mappings organized by category.

        Returns:
            Dictionary with 'widgets', 'properties', and 'keywords' keys,
            each containing their respective reverse mappings.
        """
        return {
            "widgets": {v: k for k, v in self.get_type_abbreviations().items()},
            "properties": {v: k for k, v in self.get_property_abbreviations().items()},
            "keywords": {v: k for k, v in self.get_keywords().items()},
        }
