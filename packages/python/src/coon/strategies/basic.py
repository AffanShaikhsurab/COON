"""
Basic compression strategy.

Provides simple keyword and widget abbreviations with minimal processing.
Suitable for quick compression with moderate token reduction.
"""

import re

from .base import CompressionStrategy, StrategyConfig


class BasicStrategy(CompressionStrategy):
    """
    Basic compression strategy.

    Applies simple keyword, widget, and property abbreviations
    with basic whitespace normalization.

    Expected compression ratio: 30-40%
    """

    def __init__(self, language: str = "dart"):
        """
        Initialize the basic strategy.

        Args:
            language: Language identifier (default: "dart")
        """
        super().__init__(language)

    @property
    def name(self) -> str:
        return "basic"

    @property
    def config(self) -> StrategyConfig:
        return StrategyConfig(
            name="Basic",
            description="Simple keyword and widget abbreviations with minimal processing",
            min_code_size=0,
            max_code_size=None,
            expected_ratio=0.35,
            preserve_formatting=False,
            preserve_comments=False,
            aggressive_whitespace=True,
            widget_abbreviation=True,
            property_abbreviation=True,
            keyword_abbreviation=True,
            use_ast_analysis=False,
            use_component_registry=False,
            language=self._language,
            parameters={"abbreviation_level": "standard"},
        )

    def compress(self, code: str) -> str:
        """
        Apply basic compression.

        Args:
            code: Raw Dart source code

        Returns:
            Compressed COON format string
        """
        if not code or not code.strip():
            return ""

        coon = code

        # Get abbreviation maps from language handler
        widgets, properties, keywords = self._get_abbreviations()

        # Step 1: Normalize whitespace
        coon = re.sub(r"\s+", " ", coon).strip()

        # Step 2: Remove annotations
        coon = re.sub(r"@\w+\s*", "", coon)

        # Step 3: Apply keyword abbreviations
        for full, abbrev in keywords.items():
            # Use word boundary for keywords to avoid partial matches
            coon = re.sub(r"\b" + re.escape(full) + r"\b", abbrev, coon)

        # Step 4: Apply widget abbreviations (sorted by length, longest first)
        # This prevents "Text" from being replaced before "TextField"
        sorted_widgets = sorted(widgets.items(), key=lambda x: len(x[0]), reverse=True)
        for full, short in sorted_widgets:
            coon = re.sub(r"\b" + re.escape(full) + r"\b", short, coon)

        # Step 5: Apply property abbreviations
        for full, short in properties.items():
            coon = coon.replace(full, short)

        # Step 6: Remove spaces around colons and commas for compact output
        coon = re.sub(r"\s*:\s*", ":", coon)
        coon = re.sub(r"\s*,\s*", ",", coon)

        return coon

    def supports_code(self, code: str) -> bool:
        """
        Basic strategy supports all code.

        Args:
            code: Dart source code to check

        Returns:
            Always True - basic strategy is universal
        """
        return True
