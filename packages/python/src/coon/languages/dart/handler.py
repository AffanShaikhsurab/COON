"""
Dart/Flutter language handler implementation.
"""

import json
import re
from pathlib import Path
from typing import Any, Optional

from ..base import LanguageHandler, LanguageSpec


class DartLanguageHandler(LanguageHandler):
    """
    Language handler for Dart/Flutter code.

    Provides Dart-specific lexer, parser, and abbreviation mappings
    for COON compression of Flutter applications.

    Example:
        >>> handler = DartLanguageHandler()
        >>> print(handler.spec.name)  # "dart"
        >>> widgets = handler.get_type_abbreviations()
        >>> print(widgets.get("Scaffold"))  # "S"
    """

    def __init__(self):
        """Initialize the Dart language handler."""
        self._spec_data: Optional[dict[str, Any]] = None
        self._widgets: Optional[dict[str, str]] = None
        self._properties: Optional[dict[str, str]] = None
        self._keywords: Optional[dict[str, str]] = None

    @property
    def spec(self) -> LanguageSpec:
        """Get the Dart language specification."""
        data = self._load_spec_data()
        return LanguageSpec(
            name=data.get("language", "dart"),
            version=data.get("version", "1.0.0"),
            extensions=data.get("extensions", [".dart"]),
            display_name=data.get("displayName", "Dart/Flutter"),
            framework=data.get("framework", "flutter"),
            features=data.get("features", {}),
        )

    def _get_language_data_path(self) -> Path:
        """Get path to spec/languages/dart/ directory."""
        # Navigate from packages/python/src/coon/languages/dart/ to spec/languages/dart/
        current = Path(__file__).parent

        # Try relative path first: go up to project root, then to spec/languages/dart
        # packages/python/src/coon/languages/dart -> spec/languages/dart
        spec_path = (
            current.parent.parent.parent.parent.parent.parent.parent / "spec" / "languages" / "dart"
        )

        if spec_path.exists():
            return spec_path

        # Fallback: search from cwd
        cwd_path = Path.cwd()
        for parent in [cwd_path] + list(cwd_path.parents):
            spec_path = parent / "spec" / "languages" / "dart"
            if spec_path.exists():
                return spec_path

        # Final fallback: try old spec/data location for backwards compatibility
        for parent in [current.parent.parent.parent.parent.parent.parent.parent, cwd_path] + list(
            cwd_path.parents
        ):
            old_spec_path = parent / "spec" / "data"
            if old_spec_path.exists():
                return old_spec_path

        raise FileNotFoundError(
            "Could not find spec/languages/dart directory. "
            "Ensure you're running from within the COON project."
        )

    def _load_json_file(self, filename: str) -> dict[str, Any]:
        """Load a JSON file from the language data directory."""
        path = self._get_language_data_path() / filename
        if not path.exists():
            raise FileNotFoundError(f"Language data file not found: {path}")
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    def _load_spec_data(self) -> dict[str, Any]:
        """Load and cache the spec.json file."""
        if self._spec_data is None:
            try:
                self._spec_data = self._load_json_file("spec.json")
            except FileNotFoundError:
                # Fallback defaults if spec.json doesn't exist
                self._spec_data = {
                    "language": "dart",
                    "version": "1.0.0",
                    "extensions": [".dart"],
                    "framework": "flutter",
                }
        return self._spec_data

    def get_keywords(self) -> dict[str, str]:
        """Get Dart keyword abbreviations."""
        if self._keywords is None:
            data = self._load_json_file("keywords.json")
            self._keywords = data.get("abbreviations", {})
        return self._keywords

    def get_type_abbreviations(self) -> dict[str, str]:
        """
        Get Flutter widget abbreviations.

        In Dart/Flutter, the primary "types" are widgets.
        """
        if self._widgets is None:
            data = self._load_json_file("widgets.json")
            self._widgets = data.get("abbreviations", {})
        return self._widgets

    def get_property_abbreviations(self) -> dict[str, str]:
        """Get Flutter property abbreviations."""
        if self._properties is None:
            data = self._load_json_file("properties.json")
            self._properties = data.get("abbreviations", {})
        return self._properties

    def create_lexer(self) -> Any:
        """Create a Dart lexer instance."""
        from ...parser.lexer import DartLexer

        return DartLexer()

    def create_parser(self) -> Any:
        """Create a Dart parser instance."""
        from ...parser.parser import DartParser

        return DartParser()

    def detect_language(self, code: str) -> float:
        """
        Detect if code is written in Dart/Flutter.

        Uses pattern matching to identify Dart-specific syntax.

        Args:
            code: Source code to analyze.

        Returns:
            Confidence score between 0.0 and 1.0.
        """
        if not code or not code.strip():
            return 0.0

        score = 0.0

        # High confidence patterns
        high_confidence_patterns = [
            (r"import\s+['\"]package:", 0.3),  # Dart package imports
            (r"class\s+\w+\s+extends\s+(Stateless|Stateful)Widget", 0.4),  # Flutter widgets
            (r"Widget\s+build\s*\(\s*BuildContext", 0.4),  # build method
            (r"@override", 0.15),  # Override annotation
        ]

        # Medium confidence patterns
        medium_confidence_patterns = [
            (r"\bBuildContext\b", 0.2),
            (r"\bStatelessWidget\b", 0.25),
            (r"\bStatefulWidget\b", 0.25),
            (r"\bState<\w+>", 0.2),
            (r"\bScaffold\s*\(", 0.2),
            (r"\bContainer\s*\(", 0.1),
            (r"\bColumn\s*\(", 0.1),
            (r"\bRow\s*\(", 0.1),
        ]

        # Low confidence patterns (common but not unique to Dart)
        low_confidence_patterns = [
            (r"\bclass\s+\w+", 0.05),
            (r"\bfinal\s+\w+", 0.05),
            (r"\bconst\s+\w+", 0.05),
            (r"=>", 0.03),  # Arrow function
        ]

        all_patterns = (
            high_confidence_patterns + medium_confidence_patterns + low_confidence_patterns
        )

        for pattern, weight in all_patterns:
            if re.search(pattern, code):
                score += weight

        # Cap at 1.0
        return min(score, 1.0)

    # Convenience methods for backwards compatibility with existing data module

    def get_widgets(self) -> dict[str, str]:
        """Alias for get_type_abbreviations() for backwards compatibility."""
        return self.get_type_abbreviations()

    def get_properties(self) -> dict[str, str]:
        """Alias for get_property_abbreviations() for backwards compatibility."""
        return self.get_property_abbreviations()

    def get_reverse_widgets(self) -> dict[str, str]:
        """Get reverse widget mapping (abbreviation -> full name)."""
        return {v: k for k, v in self.get_type_abbreviations().items()}

    def get_reverse_properties(self) -> dict[str, str]:
        """Get reverse property mapping (abbreviation -> full name)."""
        return {v: k for k, v in self.get_property_abbreviations().items()}

    def get_reverse_keywords(self) -> dict[str, str]:
        """Get reverse keyword mapping (abbreviation -> full keyword)."""
        return {v: k for k, v in self.get_keywords().items()}

    def get_reverse_abbreviations_by_category(self) -> dict[str, dict[str, str]]:
        """
        Get reverse abbreviation mappings organized by category.

        Returns:
            Dictionary with 'widgets', 'properties', and 'keywords' keys,
            each containing their respective reverse mappings.
        """
        return {
            "widgets": self.get_reverse_widgets(),
            "properties": self.get_reverse_properties(),
            "keywords": self.get_reverse_keywords(),
        }
