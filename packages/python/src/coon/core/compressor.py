"""
COON Compressor - Main compression engine.

This is a thin orchestrator that delegates to specialized modules
for actual compression logic.
"""

import time
from typing import Optional

from ..strategies import StrategySelector, get_strategy
from .config import CompressionConfig
from .result import CompressionResult


def count_tokens(text: str) -> int:
    """
    Estimate token count.

    Uses rough approximation: 4 characters ≈ 1 token.
    This matches common LLM tokenizer behavior.

    Args:
        text: Text to count tokens for

    Returns:
        Estimated token count
    """
    return len(text) // 4


class Compressor:
    """
    COON compression engine.

    Orchestrates the compression pipeline by:
    1. Analyzing code (optional)
    2. Selecting optimal strategy
    3. Delegating to strategy for compression
    4. Collecting metrics (optional)

    Example:
        >>> compressor = Compressor()
        >>> result = compressor.compress("class MyWidget extends StatelessWidget {}")
        >>> print(result.compressed_code)
        c:MyWidget<StatelessWidget>;
    """

    def __init__(self, config: Optional[CompressionConfig] = None, language: str = "dart"):
        """
        Initialize the compressor.

        Args:
            config: Compression configuration. Uses defaults if not provided.
            language: Language identifier (default: "dart")
        """
        self.config = config or CompressionConfig()
        self._language = language
        self._selector = StrategySelector()
        self._analyzer = None
        self._registry = None
        self._metrics = None

        # Lazy-load optional components
        if self.config.registry_path:
            self._init_registry()

        if self.config.enable_metrics:
            self._init_metrics()

    def _init_registry(self):
        """Initialize component registry if configured."""
        try:
            from ..utils.registry import ComponentRegistry

            self._registry = ComponentRegistry(self.config.registry_path)
        except ImportError:
            pass

    def _init_metrics(self):
        """Initialize metrics collector if enabled."""
        try:
            from ..analysis.metrics import MetricsCollector

            self._metrics = MetricsCollector(storage_path=self.config.metrics_storage)
        except ImportError:
            pass

    def compress(
        self,
        dart_code: str,
        strategy: str = "auto",
        analyze_code: bool = False,
        validate: bool = False,
    ) -> CompressionResult:
        """
        Compress Dart code to COON format.

        Args:
            dart_code: Original Dart source code
            strategy: Compression strategy ("auto", "basic", "aggressive", etc.)
            analyze_code: Whether to perform code analysis for insights
            validate: Whether to validate compression result

        Returns:
            CompressionResult with compressed code and metrics

        Example:
            >>> result = compressor.compress(dart_code, strategy="aggressive")
            >>> print(f"Saved {result.percentage_saved:.1f}% tokens")
        """
        start_time = time.perf_counter()

        # Handle empty input
        if not dart_code or not dart_code.strip():
            return CompressionResult(
                compressed_code="",
                original_tokens=0,
                compressed_tokens=0,
                compression_ratio=0.0,
                strategy_used=strategy,
                processing_time_ms=0.0,
            )

        original_tokens = count_tokens(dart_code)

        # Optional code analysis
        analysis = None
        if analyze_code and self._analyzer is None:
            try:
                from ..analysis.analyzer import CodeAnalyzer

                self._analyzer = CodeAnalyzer()
            except ImportError:
                pass

        if analyze_code and self._analyzer:
            analysis = self._analyzer.analyze(dart_code)

        # Strategy selection
        strategy_name = self._select_strategy(dart_code, strategy, analysis)

        # Get strategy implementation
        strategy_impl = self._get_strategy_implementation(strategy_name)

        # Execute compression
        compressed = strategy_impl.compress(dart_code)

        # Calculate metrics
        compressed_tokens = count_tokens(compressed)
        ratio = 1 - (compressed_tokens / original_tokens) if original_tokens > 0 else 0.0
        processing_time = (time.perf_counter() - start_time) * 1000

        result = CompressionResult(
            compressed_code=compressed,
            original_tokens=original_tokens,
            compressed_tokens=compressed_tokens,
            compression_ratio=ratio,
            strategy_used=strategy_name,
            processing_time_ms=processing_time,
            analysis_insights=analysis.__dict__ if analysis else None,
        )

        # Optional validation
        if validate:
            self._validate_result(dart_code, result)

        # Record metrics if enabled
        if self._metrics:
            self._metrics.record(
                strategy_used=strategy_name,
                original_tokens=original_tokens,
                compressed_tokens=compressed_tokens,
                compression_ratio=ratio,
                processing_time_ms=processing_time,
                code_size_bytes=len(dart_code),
                success=True,
                reversible=True,  # Would need actual validation
            )

        return result

    def _select_strategy(self, code: str, strategy: str, analysis=None) -> str:
        """Select the appropriate strategy."""
        if strategy.lower() != "auto":
            return strategy.lower()

        # Auto-selection based on analysis or code characteristics
        if analysis:
            # Use analysis insights for better selection
            if analysis.complexity_score > 0.7:
                return "ast_based"
            elif len(code) > 500:
                return "aggressive"
            else:
                return "basic"

        # Use selector for auto-selection
        has_registry = self._registry is not None
        selected = self._selector.select_strategy(code, len(code), has_registry=has_registry)
        return selected.value

    def _get_strategy_implementation(self, strategy_name: str):
        """Get the strategy implementation with language support."""
        if strategy_name == "component_ref" and self._registry:
            strategy = get_strategy(strategy_name, language=self._language)
            strategy.set_registry(self._registry)
            return strategy

        return get_strategy(strategy_name, language=self._language)

    def _validate_result(self, original: str, result: CompressionResult):
        """Validate compression result."""
        try:
            from ..utils.validator import CompressionValidator

            decompressor = Decompressor()
            decompressed = decompressor.decompress(result.compressed_code)
            validator = CompressionValidator(strict_mode=self.config.strict_mode)
            validation = validator.validate_compression(
                original, result.compressed_code, decompressed
            )
            if not validation.is_valid:
                import warnings

                warnings.warn(f"Validation warnings: {validation.warnings}", stacklevel=2)
        except ImportError:
            pass


class Decompressor:
    """
    COON decompressor.

    Converts COON format back to readable Dart code.

    Example:
        >>> decompressor = Decompressor()
        >>> dart = decompressor.decompress('c:MyWidget<StatelessWidget>;')
        >>> print(dart)
        class MyWidget extends StatelessWidget {}
    """

    def __init__(self, language: str = "dart"):
        """
        Initialize the decompressor.

        Args:
            language: Language identifier (default: "dart")
        """
        self._language = language
        self._reverse_widgets: dict = {}
        self._reverse_properties: dict = {}
        self._reverse_keywords: dict = {}
        self._load_reverse_maps()

    def _load_reverse_maps(self):
        """Load reverse abbreviation maps from language handler or fallback to data module."""
        try:
            from ..languages import DartLanguageHandler, LanguageRegistry

            # Ensure Dart handler is registered
            if not LanguageRegistry.is_registered(self._language):
                LanguageRegistry.register("dart", DartLanguageHandler)

            handler = LanguageRegistry.get(self._language)
            abbrevs = handler.get_reverse_abbreviations_by_category()
            self._reverse_widgets = abbrevs["widgets"]
            self._reverse_properties = abbrevs["properties"]
            self._reverse_keywords = abbrevs["keywords"]
        except Exception:
            # Fallback to data module
            from ..data import get_keywords, get_properties, get_widgets

            widgets = get_widgets()
            properties = get_properties()
            keywords = get_keywords()
            self._reverse_widgets = {v: k for k, v in widgets.items()}
            self._reverse_properties = {v: k for k, v in properties.items()}
            self._reverse_keywords = {v: k for k, v in keywords.items()}

    def decompress(self, coon_code: str, format_output: bool = True) -> str:
        """
        Decompress COON format to Dart code.

        Args:
            coon_code: Compressed COON format string
            format_output: Whether to format the output

        Returns:
            Decompressed Dart code
        """
        if not coon_code or not coon_code.strip():
            return ""

        dart = self._decompress_basic(coon_code)

        if format_output:
            dart = self._format_output(dart)

        return dart

    def _decompress_basic(self, coon_code: str) -> str:
        """Basic decompression logic."""
        import re

        dart = coon_code

        # Reverse keyword abbreviations
        for abbrev, full in self._reverse_keywords.items():
            abbrev_escaped = re.escape(abbrev)
            dart = re.sub(abbrev_escaped, full, dart)

        # Reverse widget abbreviations
        # Sort by length descending to avoid partial replacements
        for short, full in sorted(self._reverse_widgets.items(), key=lambda x: -len(x[0])):
            dart = dart.replace(short, full)

        # Reverse property abbreviations
        for short, full in sorted(self._reverse_properties.items(), key=lambda x: -len(x[0])):
            dart = dart.replace(short, full)

        # Reverse EdgeInsets
        dart = re.sub(r"@(\d+)", r"EdgeInsets.all(\1)", dart)

        # Reverse booleans
        dart = dart.replace("1", "true")
        dart = dart.replace("0", "false")

        # Reverse braces back to parentheses (careful with actual braces)
        # This is a simplified approach - full implementation would need context

        return dart

    def _format_output(self, code: str) -> str:
        """Format decompressed code."""
        import re

        # Add newlines after structural elements
        code = re.sub(r"([{};])", r"\1\n", code)

        # Basic indentation
        lines = code.split("\n")
        formatted_lines = []
        indent = 0

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if line.startswith("}"):
                indent = max(0, indent - 1)

            formatted_lines.append("  " * indent + line)

            if line.endswith("{"):
                indent += 1

        return "\n".join(formatted_lines)


# Convenience functions for backward compatibility
def compress_dart(dart_code: str, strategy: str = "auto") -> str:
    """
    Compress Dart code to COON format.

    Convenience function that creates a Compressor and returns
    just the compressed code string.

    Args:
        dart_code: Original Dart source code
        strategy: Compression strategy

    Returns:
        Compressed COON code string
    """
    compressor = Compressor()
    result = compressor.compress(dart_code, strategy=strategy)
    return result.compressed_code


def decompress_coon(coon_code: str) -> str:
    """
    Decompress COON format back to Dart.

    Convenience function that creates a Decompressor and returns
    the decompressed code string.

    Args:
        coon_code: Compressed COON code

    Returns:
        Decompressed Dart code
    """
    decompressor = Decompressor()
    return decompressor.decompress(coon_code)
