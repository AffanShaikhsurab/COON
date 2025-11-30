"""
Compression strategies with detailed configurations and adaptive selection
"""

from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Optional, Any


class CompressionStrategy(Enum):
    """Available compression strategies"""
    AUTO = "auto"
    BASIC = "basic"
    AGGRESSIVE = "aggressive"
    COMPONENT_REF = "component_ref"
    AST_BASED = "ast_based"
    SEMANTIC = "semantic"
    HYBRID = "hybrid"


@dataclass
class StrategyConfig:
    """Configuration for a compression strategy"""
    name: str
    description: str
    min_code_size: int  # Minimum code size for this strategy to be effective
    max_code_size: Optional[int]  # Maximum code size (None = unlimited)
    expected_ratio: float  # Expected compression ratio (0.0-1.0)
    preserve_formatting: bool  # Whether to preserve code formatting
    preserve_comments: bool  # Whether to preserve comments
    aggressive_whitespace: bool  # Remove all unnecessary whitespace
    widget_abbreviation: bool  # Use widget abbreviations
    property_abbreviation: bool  # Use property abbreviations
    keyword_abbreviation: bool  # Use keyword abbreviations
    use_ast_analysis: bool  # Use AST-based compression
    use_component_registry: bool  # Use component registry
    parameters: Dict[str, Any]  # Strategy-specific parameters


@dataclass
class StrategyMetrics:
    """Performance metrics for a strategy"""
    strategy: CompressionStrategy
    avg_compression_ratio: float
    avg_tokens_saved: int
    processing_time_ms: float
    success_rate: float  # Percentage of successful compressions
    reversibility_rate: float  # Percentage of perfect round-trips
    use_count: int  # Number of times used


# Strategy configurations
STRATEGY_CONFIGURATIONS: Dict[CompressionStrategy, StrategyConfig] = {
    CompressionStrategy.BASIC: StrategyConfig(
        name="Basic",
        description="Simple keyword and widget abbreviations with minimal processing",
        min_code_size=0,
        max_code_size=None,
        expected_ratio=0.3,  # 30% reduction
        preserve_formatting=False,
        preserve_comments=False,
        aggressive_whitespace=True,
        widget_abbreviation=True,
        property_abbreviation=True,
        keyword_abbreviation=True,
        use_ast_analysis=False,
        use_component_registry=False,
        parameters={"abbreviation_level": "standard"}
    ),
    
    CompressionStrategy.AGGRESSIVE: StrategyConfig(
        name="Aggressive",
        description="Maximum compression with ultra-short abbreviations and aggressive transformations",
        min_code_size=100,
        max_code_size=None,
        expected_ratio=0.7,  # 70% reduction
        preserve_formatting=False,
        preserve_comments=False,
        aggressive_whitespace=True,
        widget_abbreviation=True,
        property_abbreviation=True,
        keyword_abbreviation=True,
        use_ast_analysis=False,
        use_component_registry=False,
        parameters={
            "abbreviation_level": "ultra",
            "remove_type_annotations": True,
            "inline_constructors": True,
            "merge_similar_widgets": True
        }
    ),
    
    CompressionStrategy.COMPONENT_REF: StrategyConfig(
        name="Component Reference",
        description="Replace known components with references from registry",
        min_code_size=200,
        max_code_size=None,
        expected_ratio=0.8,  # 80% reduction for component-heavy code
        preserve_formatting=False,
        preserve_comments=False,
        aggressive_whitespace=True,
        widget_abbreviation=True,
        property_abbreviation=True,
        keyword_abbreviation=True,
        use_ast_analysis=True,
        use_component_registry=True,
        parameters={
            "component_threshold": 50,  # Min tokens to be considered a component
            "match_tolerance": 0.85  # Similarity threshold for matching
        }
    ),
    

    CompressionStrategy.AST_BASED: StrategyConfig(
        name="AST-Based",
        description="Uses abstract syntax tree analysis for intelligent compression",
        min_code_size=300,
        max_code_size=None,
        expected_ratio=0.65,  # 65% reduction
        preserve_formatting=False,
        preserve_comments=True,
        aggressive_whitespace=True,
        widget_abbreviation=True,
        property_abbreviation=True,
        keyword_abbreviation=True,
        use_ast_analysis=True,
        use_component_registry=False,
        parameters={
            "optimize_tree_structure": True,
            "eliminate_redundant_nodes": True,
            "preserve_semantics": True
        }
    ),
    
    CompressionStrategy.SEMANTIC: StrategyConfig(
        name="Semantic",
        description="Preserves semantic meaning with optimal compression",
        min_code_size=200,
        max_code_size=None,
        expected_ratio=0.6,  # 60% reduction
        preserve_formatting=False,
        preserve_comments=True,
        aggressive_whitespace=True,
        widget_abbreviation=True,
        property_abbreviation=True,
        keyword_abbreviation=True,
        use_ast_analysis=True,
        use_component_registry=False,
        parameters={
            "preserve_variable_names": True,
            "preserve_method_names": True,
            "semantic_validation": True
        }
    ),
    
    CompressionStrategy.HYBRID: StrategyConfig(
        name="Hybrid",
        description="Combines multiple strategies for optimal results",
        min_code_size=400,
        max_code_size=None,
        expected_ratio=0.75,  # 75% reduction
        preserve_formatting=False,
        preserve_comments=False,
        aggressive_whitespace=True,
        widget_abbreviation=True,
        property_abbreviation=True,
        keyword_abbreviation=True,
        use_ast_analysis=True,
        use_component_registry=True,
        parameters={
            "primary_strategy": "aggressive",
            "fallback_strategies": ["ast_based", "component_ref"],
            "optimization_passes": 3
        }
    ),
}


class StrategySelector:
    """Intelligent strategy selection based on code analysis"""
    
    def __init__(self):
        self.metrics: Dict[CompressionStrategy, StrategyMetrics] = {}
        self._initialize_metrics()
    
    def _initialize_metrics(self):
        """Initialize default metrics for all strategies"""
        for strategy, config in STRATEGY_CONFIGURATIONS.items():
            self.metrics[strategy] = StrategyMetrics(
                strategy=strategy,
                avg_compression_ratio=config.expected_ratio,
                avg_tokens_saved=0,
                processing_time_ms=0.0,
                success_rate=1.0,
                reversibility_rate=1.0,
                use_count=0
            )
    
    def select_strategy(
        self, 
        code: str, 
        code_size: int,
        has_registry: bool = False,
        prefer_speed: bool = False
    ) -> CompressionStrategy:
        """
        Select the best compression strategy based on code analysis
        
        Args:
            code: Source code to analyze
            code_size: Size of code in characters
            has_registry: Whether component registry is available
            prefer_speed: Whether to prefer faster strategies
            
        Returns:
            Recommended compression strategy
        """
        # Analyze code characteristics
        widget_count = code.count('Widget')
        class_count = code.count('class ')
        has_templates = self._detect_template_patterns(code)
        complexity = self._estimate_complexity(code)
        
        # Score each strategy
        scores = {}
        for strategy, config in STRATEGY_CONFIGURATIONS.items():
            if strategy == CompressionStrategy.AUTO:
                continue
            
            score = 0.0
            
            # Size compatibility
            if config.min_code_size <= code_size:
                if config.max_code_size is None or code_size <= config.max_code_size:
                    score += 1.0
            
            # Component registry dependency
            if config.use_component_registry and not has_registry:
                score -= 0.5
            elif config.use_component_registry and has_registry:
                score += 0.3
            

            # Performance consideration
            if prefer_speed and not config.use_ast_analysis:
                score += 0.2
            
            # Expected compression ratio
            score += config.expected_ratio
            
            # Historical performance
            if strategy in self.metrics:
                metrics = self.metrics[strategy]
                score += metrics.success_rate * 0.3
                score += metrics.reversibility_rate * 0.2
            
            scores[strategy] = score
        
        # Select strategy with highest score
        best_strategy = max(scores.items(), key=lambda x: x[1])[0]
        return best_strategy
    

    def _estimate_complexity(self, code: str) -> float:
        """Estimate code complexity (0.0-1.0)"""
        # Simple heuristic based on nesting and structure
        depth = 0
        max_depth = 0
        for char in code:
            if char in '{([':
                depth += 1
                max_depth = max(max_depth, depth)
            elif char in '})]':
                depth -= 1
        
        # Normalize to 0-1 range (assume max depth of 10 is high complexity)
        return min(max_depth / 10.0, 1.0)
    
    def update_metrics(
        self,
        strategy: CompressionStrategy,
        compression_ratio: float,
        tokens_saved: int,
        processing_time_ms: float,
        success: bool,
        reversible: bool
    ):
        """Update historical metrics for a strategy"""
        if strategy not in self.metrics:
            return
        
        metrics = self.metrics[strategy]
        n = metrics.use_count
        
        # Running average update
        metrics.avg_compression_ratio = (
            (metrics.avg_compression_ratio * n + compression_ratio) / (n + 1)
        )
        metrics.avg_tokens_saved = (
            (metrics.avg_tokens_saved * n + tokens_saved) // (n + 1)
        )
        metrics.processing_time_ms = (
            (metrics.processing_time_ms * n + processing_time_ms) / (n + 1)
        )
        
        # Success and reversibility rates
        success_count = int(metrics.success_rate * n) + (1 if success else 0)
        reversible_count = int(metrics.reversibility_rate * n) + (1 if reversible else 0)
        
        metrics.use_count += 1
        metrics.success_rate = success_count / metrics.use_count
        metrics.reversibility_rate = reversible_count / metrics.use_count
    
    def get_strategy_config(self, strategy: CompressionStrategy) -> StrategyConfig:
        """Get configuration for a specific strategy"""
        return STRATEGY_CONFIGURATIONS.get(strategy)
    
    def compare_strategies(self) -> List[tuple[CompressionStrategy, StrategyMetrics]]:
        """Get all strategies sorted by effectiveness"""
        return sorted(
            self.metrics.items(),
            key=lambda x: x[1].avg_compression_ratio * x[1].success_rate,
            reverse=True
        )
