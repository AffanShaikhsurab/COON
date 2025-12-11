"""JavaScript language handler for COON compression."""

from typing import Dict, Any
from ..base import LanguageHandler


class JavaScriptHandler(LanguageHandler):
    """Handler for JavaScript/React code compression."""

    def __init__(self, spec_data: Dict[str, Any]):
        super().__init__(spec_data)
        self.language = "javascript"

    def compress(self, code: str) -> str:
        """Compress JavaScript code using COON format."""
        # Basic implementation - can be extended
        compressed = code
        
        # Apply keyword replacements
        if "keywords" in self.spec_data:
            for keyword, abbrev in self.spec_data["keywords"].items():
                compressed = compressed.replace(f" {keyword} ", f" {abbrev} ")
        
        return compressed

    def decompress(self, compressed_code: str) -> str:
        """Decompress COON format back to JavaScript."""
        decompressed = compressed_code
        
        # Reverse keyword replacements
        if "keywords" in self.spec_data:
            for keyword, abbrev in self.spec_data["keywords"].items():
                decompressed = decompressed.replace(f" {abbrev} ", f" {keyword} ")
        
        return decompressed
