"""
COON Compressor - Enhanced version
Main compression/decompression engine with integrated modules
"""

import re
import time
from dataclasses import dataclass
from typing import Optional
from .strategy import CompressionStrategy, StrategySelector, STRATEGY_CONFIGURATIONS
from .analyzer import CodeAnalyzer
from .registry import ComponentRegistry
from .metrics import MetricsCollector
from .formatter import DartFormatter
from .validator import CompressionValidator


@dataclass
class CompressionResult:
    """Result of compression operation"""
    compressed_code: str
    original_tokens: int
    compressed_tokens: int
    compression_ratio: float
    strategy_used: CompressionStrategy
    processing_time_ms: float
    analysis_insights: Optional[dict] = None
    
    @property
    def token_savings(self) -> int:
        return self.original_tokens - self.compressed_tokens
    
    @property
    def percentage_saved(self) -> float:
        return self.compression_ratio * 100


# Abbreviation dictionaries - expanded
KEYWORD_ABBREV = {
    'class': 'c:',
    'final': 'f:',
    'extends': '<',
    'import': 'im:',
    'return': 'ret',
    'async': 'asy',
    'await': 'awt',
    'const': 'cn:',
    'static': 'st:',
    'void': 'v:',
    'override': 'ov:',
}

# Ultra-short widget abbreviations
ULTRA_WIDGETS = {
    'Scaffold': 'S',
    'Column': 'C',
    'Row': 'R',
    'SafeArea': 'A',
    'Padding': 'P',
    'Text': 'T',
    'AppBar': 'B',
    'SizedBox': 'Z',
    'TextField': 'F',
    'ElevatedButton': 'E',
    'TextStyle': 'Y',
    'InputDecoration': 'D',
    'OutlineInputBorder': 'O',
    'TextEditingController': 'X',
    'Container': 'K',
    'Center': 'N',
    'Expanded': 'Ex',
    'ListView': 'L',
    'GridView': 'G',
    'Stack': 'St',
    'Positioned': 'Ps',
    'Card': 'Cd',
    'IconButton': 'Ib',
    'Icon': 'Ic',
}

# Ultra-short property abbreviations
ULTRA_PROPS = {
    'appBar:': 'a:',
    'body:': 'b:',
    'child:': 'c:',
    'children:': 'h:',
    'title:': 't:',
    'controller:': 'r:',
    'padding:': 'p:',
    'onPressed:': 'o:',
    'style:': 's:',
    'fontSize:': 'z:',
    'fontWeight:': 'w:',
    'color:': 'l:',
    'decoration:': 'd:',
    'labelText:': 'L:',
    'hintText:': 'H:',
    'border:': 'B:',
    'height:': 'e:',
    'width:': 'W:',
    'obscureText:': 'x:',
    'centerTitle:': 'T:',
    'mainAxisAlignment:': 'A:',
    'crossAxisAlignment:': 'X:',
    'minimumSize:': 'M:',
}


def count_tokens(text: str) -> int:
    """Estimate token count (rough: 4 chars ≈ 1 token)"""
    return len(text) // 4


class Compressor:
    """Enhanced COON compression engine"""
    
    def __init__(
        self,
        component_registry: Optional[str] = None,
        enable_metrics: bool = False,
        metrics_storage: Optional[str] = None
    ):
        """
        Initialize compressor
        
        Args:
            component_registry: Path to component registry JSON (optional)
            enable_metrics: Whether to collect metrics
            metrics_storage: Path to metrics storage file
        """
        self.strategy_selector = StrategySelector()
        self.analyzer = CodeAnalyzer()
        self.component_registry = ComponentRegistry(component_registry) if component_registry else None
        self.formatter = DartFormatter()
        self.validator = CompressionValidator()
        
        # Metrics
        self.enable_metrics = enable_metrics
        if self.enable_metrics:
            self.metrics = MetricsCollector(storage_path=metrics_storage)
        else:
            self.metrics = None
    
    def compress(
        self,
        dart_code: str,
        strategy: str = "auto",
        analyze_code: bool = True,
        validate: bool = False
    ) -> CompressionResult:
        """
        Compress Dart code to COON format
        
        Args:
            dart_code: Original Dart source code
            strategy: Compression strategy ("auto", "basic", "aggressive", etc.)
            analyze_code: Whether to perform code analysis
            validate: Whether to validate compression
            
        Returns:
            CompressionResult with compressed code and stats
        """
        start_time = time.time()
        
        original_tokens = count_tokens(dart_code)
        
        # Optional code analysis
        analysis = None
        if analyze_code:
            analysis = self.analyzer.analyze(dart_code)
        
        # Select strategy
        if strategy == "auto":
            if analysis:
                strategy_enum = CompressionStrategy[self.analyzer.recommend_strategy(analysis).upper()]
            else:
                # Use basic analysis for strategy selection
                has_registry = self.component_registry is not None
                strategy_enum = self.strategy_selector.select_strategy(
                    dart_code,
                    len(dart_code),
                    has_registry=has_registry
                )
        else:
            try:
                strategy_enum = CompressionStrategy[strategy.upper()]
            except KeyError:
                strategy_enum = CompressionStrategy.BASIC
        
        # Get strategy configuration
        config = STRATEGY_CONFIGURATIONS.get(strategy_enum)
        
        # Apply compression based on strategy
        if strategy_enum == CompressionStrategy.COMPONENT_REF and config.use_component_registry and self.component_registry:
            compressed = self._compress_with_components(dart_code)
        elif strategy_enum == CompressionStrategy.AST_BASED and config.use_ast_analysis:
            compressed = self._compress_ast_based(dart_code)
        elif strategy_enum == CompressionStrategy.AGGRESSIVE:
            compressed = self._compress_aggressive(dart_code)
        else:
            compressed = self._compress_basic(dart_code)
        
        compressed_tokens = count_tokens(compressed)
        ratio = 1 - (compressed_tokens / original_tokens) if original_tokens > 0 else 0.0
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        result = CompressionResult(
            compressed_code=compressed,
            original_tokens=original_tokens,
            compressed_tokens=compressed_tokens,
            compression_ratio=ratio,
            strategy_used=strategy_enum,
            processing_time_ms=processing_time,
            analysis_insights=analysis.__dict__ if analysis else None
        )
        
        # Validate if requested
        if validate:
            decompressed = self.decompress(compressed)
            validation = self.validator.validate_compression(dart_code, compressed, decompressed)
            if not validation.is_valid:
                print(f"⚠️  Validation warnings: {validation.warnings}")
        
        # Record metrics
        if self.enable_metrics and self.metrics:
            reversible = True  # Would need actual validation
            self.metrics.record(
                strategy_used=strategy_enum.value,
                original_tokens=original_tokens,
                compressed_tokens=compressed_tokens,
                compression_ratio=ratio,
                processing_time_ms=processing_time,
                code_size_bytes=len(dart_code),
                success=True,
                reversible=reversible
            )
        
        return result
    
    def decompress(self, coon_code: str, format_output: bool = True) -> str:
        """
        Decompress COON format back to Dart
        
        Args:
            coon_code: Compressed COON code
            format_output: Whether to format the output
            
        Returns:
            Original Dart code (approximately)
        """
        dart = self._decompress_basic(coon_code)
        
        if format_output:
            dart = self.formatter.format(dart)
        
        return dart
    
    def _compress_basic(self, dart_code: str) -> str:
        """Basic compression with keyword and widget abbreviations"""
        coon = dart_code
        
        # Strip whitespace
        coon = re.sub(r'\s+', ' ', coon).strip()
        
        # Remove annotations
        coon = re.sub(r'@\w+ ', '', coon)
        
        # Apply keyword abbreviations
        for full, abbrev in KEYWORD_ABBREV.items():
            coon = re.sub(r'\b' + full + r'\b', abbrev, coon)
        
        # Apply widget abbreviations
        for full, short in ULTRA_WIDGETS.items():
            coon = coon.replace(full, short)
        
        # Apply property abbreviations
        for full, short in ULTRA_PROPS.items():
            coon = coon.replace(full, short)
        
        return coon
    
    def _compress_aggressive(self, dart_code: str) -> str:
        """Ultra compression - same as current implementation"""
        coon = dart_code
        
        # 1. Strip ALL whitespace
        coon = re.sub(r'\s+', ' ', coon).strip()
        
        # 2. Remove annotations
        coon = re.sub(r'@\w+ ', '', coon)
        
        # 3. Class declarations
        coon = re.sub(r'class (\w+) extends (\w+) \{', r'c:\1<\2>;', coon)
        
        # 4. Collect and merge fields
        fields = []
        def collect_field(m):
            fields.append(f"{m.group(2)}={m.group(3)}")
            return ''
        coon = re.sub(r'final (\w+) (\w+) = (\w+)\(\);? ?', collect_field, coon)
        
        # 5. Method signatures
        coon = re.sub(r'Widget build\(BuildContext context\) \{', 'm:b ', coon)
        
        # 6. Remove return
        coon = re.sub(r'return ', '', coon)
        
        # 7. Ultra-short widgets
        for full, short in ULTRA_WIDGETS.items():
            coon = coon.replace(full, short)
        
        # 8. Ultra-short properties
        for full, short in ULTRA_PROPS.items():
            coon = coon.replace(full, short)
        
        # 9. EdgeInsets.all(N) → @N
        coon = re.sub(r'EdgeInsets\.all\((\d+)(?:\.\d+)?\)', r'@\1', coon)
        
        # 10. Constructor calls: Type() → ~Type
        coon = re.sub(r'(\w+)\(\)', r'~\1', coon)
        
        # 11. Remove spaces around delimiters
        coon = re.sub(r' ?([:,{}\[\]()]) ?', r'\1', coon)
        
        # 12. Replace ( with {
        coon = coon.replace('(', '{')
        coon = coon.replace(')', '}')
        
        # 13. Remove redundant braces for strings
        coon = re.sub(r'([A-Z]){\"([^\"]*)\"}', r'\1"\2"', coon)
        
        # 14. Boolean shorthand
        coon = coon.replace('true', '1')
        coon = coon.replace('false', '0')
        
        # 15. Rebuild with fields
        if fields:
            field_str = 'f:' + ','.join(fields) + ';'
            parts = coon.split('m:b')
            if len(parts) == 2:
                coon = f"{parts[0]}{field_str}m:b{parts[1]}"
        
        # Final cleanup
        coon = re.sub(r';+', ';', coon)
        coon = re.sub(r';+}', '}', coon)
        coon = re.sub(r'}\s*}', '}}', coon)
        
        return coon.strip()
    

    def _compress_with_components(self, dart_code: str) -> str:
        """Compress using component registry"""
        if not self.component_registry:
            return self._compress_aggressive(dart_code)
        
        # Find matching component
        component = self.component_registry.find_matching_component(dart_code, tolerance=0.85)
        
        if component:
            # Use component reference
            compressed = component.compress_reference()
            return compressed
        
        # Fall back to aggressive compression
        return self._compress_aggressive(dart_code)
    
    def _compress_ast_based(self, dart_code: str) -> str:
        """AST-based compression (placeholder for now)"""
        # In a full implementation, would:
        # 1. Parse code into AST
        # 2. Optimize AST structure
        # 3. Serialize optimized AST
        
        # For now, use aggressive compression
        return self._compress_aggressive(dart_code)
    
    def _decompress_basic(self, coon_code: str) -> str:
        """Basic decompression"""
        dart = coon_code
        
        # Reverse keyword abbreviations
        for full, abbrev in KEYWORD_ABBREV.items():
            # Escape special regex characters
            abbrev_escaped = re.escape(abbrev)
            dart = re.sub(abbrev_escaped, full, dart)
        
        # Reverse ultra widgets
        for full, short in ULTRA_WIDGETS.items():
            dart = dart.replace(short, full)
        
        # Reverse ultra properties
        for full, short in ULTRA_PROPS.items():
            dart = dart.replace(short, full)
        
        # Reverse EdgeInsets
        dart = re.sub(r'@(\d+)', r'EdgeInsets.all(\1)', dart)
        
        # Add spacing
        dart = re.sub(r'([{};])', r'\1\n', dart)
        
        return dart


# Convenience functions
def compress_dart(dart_code: str, strategy: str = "auto") -> str:
    """
    Compress Dart code to COON format
    
    Args:
        dart_code: Original Dart source code
        strategy: Compression strategy
        
    Returns:
        Compressed COON code string
    """
    compressor = Compressor()
    result = compressor.compress(dart_code, strategy)
    return result.compressed_code


def decompress_coon(coon_code: str) -> str:
    """
    Decompress COON format back to Dart
    
    Args:
        coon_code: Compressed COON code
        
    Returns:
        Decompressed Dart code
    """
    compressor = Compressor()
    return compressor.decompress(coon_code)
