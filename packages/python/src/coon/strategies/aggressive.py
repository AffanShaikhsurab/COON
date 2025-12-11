"""
Aggressive compression strategy.

Maximum compression with ultra-short abbreviations and aggressive transformations.
Achieves 60-70% token reduction.
"""

import re

from .base import CompressionStrategy, StrategyConfig


class AggressiveStrategy(CompressionStrategy):
    """
    Aggressive compression strategy.

    Applies maximum compression including:
    - Ultra-short abbreviations
    - Complete whitespace removal
    - Constructor shorthand
    - Boolean shorthand
    - Structure optimization

    Expected compression ratio: 60-70%
    """

    def __init__(self, language: str = "dart"):
        """
        Initialize the aggressive strategy.

        Args:
            language: Language identifier (default: "dart")
        """
        super().__init__(language)

    @property
    def name(self) -> str:
        return "aggressive"

    @property
    def config(self) -> StrategyConfig:
        return StrategyConfig(
            name="Aggressive",
            description="Maximum compression with ultra-short abbreviations and aggressive transformations",
            min_code_size=100,
            max_code_size=None,
            expected_ratio=0.70,
            preserve_formatting=False,
            preserve_comments=False,
            aggressive_whitespace=True,
            widget_abbreviation=True,
            property_abbreviation=True,
            keyword_abbreviation=True,
            use_ast_analysis=False,
            use_component_registry=False,
            language=self._language,
            parameters={
                "abbreviation_level": "ultra",
                "remove_type_annotations": True,
                "inline_constructors": True,
                "merge_similar_widgets": True,
            },
        )

    def compress(self, code: str) -> str:
        """
        Apply aggressive compression.

        Args:
            code: Raw Dart source code

        Returns:
            Maximally compressed COON format string
        """
        if not code or not code.strip():
            return ""

        coon = code

        # Get abbreviation maps from language handler
        widgets, properties, keywords = self._get_abbreviations()

        # 1. Strip ALL whitespace
        coon = re.sub(r"\s+", " ", coon).strip()

        # 2. Remove annotations
        coon = re.sub(r"@\w+\s*", "", coon)

        # 3. Class declarations (with extends)
        coon = re.sub(r"class\s+(\w+)\s+extends\s+(\w+)\s*\{", r"c:\1 < \2{", coon)

        # 3b. Class declarations (without extends)
        coon = re.sub(r"class\s+(\w+)\s*\{", r"c:\1{", coon)

        # 4. Collect and merge fields
        fields: list[str] = []

        def collect_field(match):
            field_name = match.group(2)
            field_value = match.group(3)
            fields.append(f"{field_name}={field_value}")
            return ""

        coon = re.sub(r"final\s+(\w+)\s+(\w+)\s*=\s*(\w+)\(\)\s*;?\s*", collect_field, coon)

        # 5. Method signatures
        coon = re.sub(r"Widget\s+build\s*\(\s*BuildContext\s+\w+\s*\)\s*\{", "m:b ", coon)

        # 6. Remove return keyword
        coon = re.sub(r"\breturn\s+", "", coon)

        # 7. Apply widget abbreviations (sorted by length, longest first)
        sorted_widgets = sorted(widgets.items(), key=lambda x: len(x[0]), reverse=True)
        for full, short in sorted_widgets:
            coon = re.sub(r"\b" + re.escape(full) + r"\b", short, coon)

        # 8. Apply property abbreviations
        for full, short in properties.items():
            coon = coon.replace(full, short)

        # 8b. Apply keyword abbreviations (for keywords not handled by regex)
        # Handle 'final' keyword specifically with word boundary
        coon = re.sub(r"\bfinal\s+", "f:", coon)
        # Handle other keywords
        for full, short in keywords.items():
            if full not in ("class", "extends", "return", "final"):  # Already handled
                coon = re.sub(rf"\b{re.escape(full)}\b", short, coon)

        # 9. EdgeInsets.all(N) → @N
        coon = re.sub(r"EdgeInsets\.all\((\d+)(?:\.\d+)?\)", r"@\1", coon)

        # 10. Constructor calls: Type() → ~Type
        coon = re.sub(r"(\w+)\(\)", r"~\1", coon)

        # 11. Remove spaces around delimiters
        coon = re.sub(r"\s*([:,{}\[\]()])\s*", r"\1", coon)

        # 12. Replace ( with { and ) with }
        coon = coon.replace("(", "{")
        coon = coon.replace(")", "}")

        # 13. Remove redundant braces for strings
        coon = re.sub(r'([A-Z])\{"([^"]*)"}\s*', r'\1"\2"', coon)

        # 14. Boolean shorthand
        coon = coon.replace("true", "1")
        coon = coon.replace("false", "0")

        # 15. Rebuild with fields
        if fields:
            field_str = "f:" + ",".join(fields) + ";"
            parts = coon.split("m:b")
            if len(parts) == 2:
                coon = f"{parts[0]}{field_str}m:b{parts[1]}"

        # Final cleanup
        coon = re.sub(r";+", ";", coon)  # Collapse multiple semicolons
        coon = re.sub(r"}\s*}", "}}", coon)

        return coon.strip()

    def supports_code(self, code: str) -> bool:
        """
        Check if aggressive strategy is suitable.

        Args:
            code: Dart source code to check

        Returns:
            True if code is large enough to benefit from aggressive compression
        """
        return len(code) >= self.config.min_code_size
