"""
AST-based compression strategy.

Uses abstract syntax tree analysis for intelligent compression.
Preserves semantic structure while achieving good compression.
"""

import re

from .aggressive import AggressiveStrategy
from .base import CompressionStrategy, StrategyConfig


class ASTBasedStrategy(CompressionStrategy):
    """
    AST-based compression strategy.

    Uses abstract syntax tree analysis for more intelligent compression
    decisions. Better for complex code with nested structures.

    Expected compression ratio: 50-65%
    """

    def __init__(self, language: str = "dart"):
        """
        Initialize the AST-based strategy.

        Args:
            language: Language identifier (default: "dart")
        """
        super().__init__(language)
        self._fallback = AggressiveStrategy(language)

    @property
    def name(self) -> str:
        return "ast_based"

    @property
    def config(self) -> StrategyConfig:
        return StrategyConfig(
            name="AST-Based",
            description="Uses abstract syntax tree analysis for intelligent compression",
            min_code_size=300,
            max_code_size=None,
            expected_ratio=0.65,
            preserve_formatting=False,
            preserve_comments=True,
            aggressive_whitespace=True,
            widget_abbreviation=True,
            property_abbreviation=True,
            keyword_abbreviation=True,
            use_ast_analysis=True,
            use_component_registry=False,
            language=self._language,
            parameters={
                "optimize_tree_structure": True,
                "eliminate_redundant_nodes": True,
                "preserve_semantics": True,
            },
        )

    def compress(self, code: str) -> str:
        """
        Apply AST-based compression.

        Note: Full AST implementation is planned. Currently falls back
        to aggressive strategy with additional structure preservation.

        Args:
            code: Raw Dart source code

        Returns:
            Compressed COON format string
        """
        if not code or not code.strip():
            return ""

        # TODO: Implement full AST-based compression
        # For now, use aggressive strategy with comment preservation

        # Extract and preserve comments
        comments = []
        comment_pattern = r"(//[^\n]*|/\*[\s\S]*?\*/)"

        def preserve_comment(match):
            comments.append(match.group(0))
            return f"__COMMENT_{len(comments) - 1}__"

        code_with_placeholders = re.sub(comment_pattern, preserve_comment, code)

        # Apply aggressive compression
        compressed = self._fallback.compress(code_with_placeholders)

        # Note: In a full implementation, we would:
        # 1. Parse code into AST using parser module
        # 2. Analyze AST structure for optimization opportunities
        # 3. Apply targeted compressions based on AST analysis
        # 4. Serialize optimized AST back to COON format

        return compressed

    def supports_code(self, code: str) -> bool:
        """
        Check if AST-based strategy is suitable.

        Args:
            code: Dart source code to check

        Returns:
            True if code is complex enough to benefit from AST analysis
        """
        # AST strategy is best for larger, more complex code
        if len(code) < self.config.min_code_size:
            return False

        # Check for complexity indicators
        has_nested_widgets = code.count("child:") > 2 or code.count("children:") > 1
        has_multiple_classes = code.count("class ") > 1

        return has_nested_widgets or has_multiple_classes
