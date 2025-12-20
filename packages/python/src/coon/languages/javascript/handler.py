"""JavaScript language handler for COON compression."""

from typing import Any, Optional

from ..base import LanguageHandler, LanguageSpec


class JavaScriptHandler(LanguageHandler):
    """Handler for JavaScript/React code compression."""

    def __init__(self, spec_data: Optional[dict[str, Any]] = None):
        self._spec_data = spec_data or {}
        self.language = "javascript"

    @property
    def spec(self) -> LanguageSpec:
        """Get the language specification."""
        return LanguageSpec(
            name="javascript",
            version="1.0.0",
            extensions=[".js", ".jsx", ".ts", ".tsx"],
            display_name="JavaScript",
            framework="React"
        )

    def get_keywords(self) -> dict[str, str]:
        """Get keyword abbreviations for JavaScript."""
        return self._spec_data.get("keywords", {})

    def get_type_abbreviations(self) -> dict[str, str]:
        """Get type/class abbreviations for JavaScript."""
        return self._spec_data.get("types", {})

    def get_property_abbreviations(self) -> dict[str, str]:
        """Get property/parameter abbreviations for JavaScript."""
        return self._spec_data.get("properties", {})

    def create_lexer(self) -> Any:
        """Create a lexer instance for JavaScript."""
        return None  # Not implemented yet

    def create_parser(self) -> Any:
        """Create a parser instance for JavaScript."""
        return None  # Not implemented yet

    def detect_language(self, code: str) -> float:
        """Detect if code is JavaScript."""
        score = 0.0
        # Check for common JavaScript patterns
        if "function" in code or "const " in code or "let " in code:
            score += 0.3
        if "=>" in code:  # Arrow functions
            score += 0.2
        if "import " in code and "from " in code:
            score += 0.2
        if "export " in code:
            score += 0.1
        if ".jsx" in code or "React" in code:
            score += 0.2
        return min(score, 1.0)

    def compress(self, code: str) -> str:
        """Compress JavaScript code using COON format."""
        # Basic implementation - can be extended
        compressed = code

        # Apply keyword replacements
        if "keywords" in self._spec_data:
            for keyword, abbrev in self._spec_data["keywords"].items():
                compressed = compressed.replace(f" {keyword} ", f" {abbrev} ")

        return compressed

    def decompress(self, compressed_code: str) -> str:
        """Decompress COON format back to JavaScript."""
        decompressed = compressed_code

        # Reverse keyword replacements
        if "keywords" in self._spec_data:
            for keyword, abbrev in self._spec_data["keywords"].items():
                decompressed = decompressed.replace(f" {abbrev} ", f" {keyword} ")

        return decompressed
