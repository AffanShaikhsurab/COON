"""
Strategy selector for intelligent strategy selection.

Analyzes code characteristics to select the optimal compression strategy.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class StrategyName(Enum):
    """Available compression strategy names."""

    AUTO = "auto"
    BASIC = "basic"
    AGGRESSIVE = "aggressive"
    AST_BASED = "ast_based"
    COMPONENT_REF = "component_ref"


@dataclass
class StrategyMetrics:
    """Performance metrics for a strategy."""

    strategy: StrategyName
    avg_compression_ratio: float = 0.0
    avg_tokens_saved: int = 0
    processing_time_ms: float = 0.0
    success_rate: float = 1.0
    reversibility_rate: float = 1.0
    use_count: int = 0


class StrategySelector:
    """
    Intelligent strategy selector.

    Analyzes code characteristics and historical performance
    to select the optimal compression strategy.
    """

    def __init__(self):
        self._metrics: dict[StrategyName, StrategyMetrics] = {}
        self._initialize_metrics()

    def _initialize_metrics(self):
        """Initialize default metrics for all strategies."""
        default_ratios = {
            StrategyName.BASIC: 0.35,
            StrategyName.AGGRESSIVE: 0.70,
            StrategyName.AST_BASED: 0.65,
            StrategyName.COMPONENT_REF: 0.80,
        }

        for strategy in StrategyName:
            if strategy == StrategyName.AUTO:
                continue

            self._metrics[strategy] = StrategyMetrics(
                strategy=strategy, avg_compression_ratio=default_ratios.get(strategy, 0.5)
            )

    def select_strategy(
        self,
        code: str,
        code_size: Optional[int] = None,
        has_registry: bool = False,
        prefer_speed: bool = False,
    ) -> StrategyName:
        """
        Select the best compression strategy for the given code.

        Args:
            code: Source code to analyze
            code_size: Size of code in characters (optional, computed if not provided)
            has_registry: Whether component registry is available
            prefer_speed: Whether to prefer faster strategies

        Returns:
            Recommended StrategyName
        """
        if code_size is None:
            code_size = len(code)

        # Very small code - use basic
        if code_size < 100:
            return StrategyName.BASIC

        # Analyze code characteristics
        complexity = self._estimate_complexity(code)

        # Score each strategy
        scores: dict[StrategyName, float] = {}

        for strategy in [
            StrategyName.BASIC,
            StrategyName.AGGRESSIVE,
            StrategyName.AST_BASED,
            StrategyName.COMPONENT_REF,
        ]:
            score = 0.0

            # Size compatibility
            min_sizes = {
                StrategyName.BASIC: 0,
                StrategyName.AGGRESSIVE: 100,
                StrategyName.AST_BASED: 300,
                StrategyName.COMPONENT_REF: 200,
            }

            if code_size >= min_sizes.get(strategy, 0):
                score += 1.0

            # Component registry dependency
            if strategy == StrategyName.COMPONENT_REF:
                if not has_registry:
                    score -= 0.5
                else:
                    score += 0.3

            # Performance consideration
            if prefer_speed:
                if strategy in [StrategyName.BASIC, StrategyName.AGGRESSIVE]:
                    score += 0.2

            # Expected compression ratio
            if strategy in self._metrics:
                score += self._metrics[strategy].avg_compression_ratio

            # Historical performance
            if strategy in self._metrics:
                metrics = self._metrics[strategy]
                score += metrics.success_rate * 0.3
                score += metrics.reversibility_rate * 0.2

            # Complexity matching
            if complexity > 0.7 and strategy == StrategyName.AST_BASED:
                score += 0.3

            scores[strategy] = score

        # Select strategy with highest score
        best_strategy = max(scores.items(), key=lambda x: x[1])[0]
        return best_strategy

    def _detect_template_patterns(self, code: str) -> bool:
        """Detect if code contains template patterns."""
        # Look for repeated similar structures
        patterns = ["children:", "child:", "builder:"]
        count = sum(code.count(p) for p in patterns)
        return count > 3

    def _estimate_complexity(self, code: str) -> float:
        """
        Estimate code complexity (0.0-1.0).

        Args:
            code: Source code to analyze

        Returns:
            Complexity score between 0 and 1
        """
        depth = 0
        max_depth = 0

        for char in code:
            if char in "{([":
                depth += 1
                max_depth = max(max_depth, depth)
            elif char in "})]":
                depth = max(0, depth - 1)

        # Normalize to 0-1 range (assume max depth of 10 is high complexity)
        return min(max_depth / 10.0, 1.0)

    def update_metrics(
        self,
        strategy: StrategyName,
        compression_ratio: float,
        tokens_saved: int,
        processing_time_ms: float,
        success: bool,
        reversible: bool,
    ):
        """
        Update historical metrics for a strategy.

        Args:
            strategy: Strategy that was used
            compression_ratio: Achieved compression ratio
            tokens_saved: Number of tokens saved
            processing_time_ms: Processing time in milliseconds
            success: Whether compression was successful
            reversible: Whether round-trip was perfect
        """
        if strategy not in self._metrics:
            return

        metrics = self._metrics[strategy]
        n = metrics.use_count

        # Running average update
        metrics.avg_compression_ratio = (metrics.avg_compression_ratio * n + compression_ratio) / (
            n + 1
        )
        metrics.avg_tokens_saved = int((metrics.avg_tokens_saved * n + tokens_saved) / (n + 1))
        metrics.processing_time_ms = (metrics.processing_time_ms * n + processing_time_ms) / (n + 1)

        # Success and reversibility rates
        success_count = int(metrics.success_rate * n) + (1 if success else 0)
        reversible_count = int(metrics.reversibility_rate * n) + (1 if reversible else 0)

        metrics.use_count += 1
        metrics.success_rate = success_count / metrics.use_count
        metrics.reversibility_rate = reversible_count / metrics.use_count

    def get_metrics(self, strategy: StrategyName) -> Optional[StrategyMetrics]:
        """Get metrics for a specific strategy."""
        return self._metrics.get(strategy)

    def compare_strategies(self) -> list[tuple[StrategyName, StrategyMetrics]]:
        """Get all strategies sorted by effectiveness."""
        return sorted(
            self._metrics.items(),
            key=lambda x: x[1].avg_compression_ratio * x[1].success_rate,
            reverse=True,
        )
