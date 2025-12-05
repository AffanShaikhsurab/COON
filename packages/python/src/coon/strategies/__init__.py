"""
Compression strategies module.

Provides different compression strategies following the Strategy Pattern.
Each strategy implements different trade-offs between compression ratio,
speed, and code preservation.

Available Strategies:
    - BasicStrategy: Simple abbreviations, 30-40% compression
    - AggressiveStrategy: Maximum compression, 60-70% reduction
    - ASTBasedStrategy: Intelligent AST-based compression, 50-65% reduction
    - ComponentRefStrategy: Component registry lookup, 70-80% reduction
"""

from typing import Optional

from .aggressive import AggressiveStrategy
from .ast_based import ASTBasedStrategy
from .base import CompressionStrategy, DecompressionStrategy, StrategyConfig
from .basic import BasicStrategy
from .component_ref import ComponentRefStrategy
from .selector import StrategyMetrics, StrategyName, StrategySelector

# Registry of available strategies
_STRATEGIES: dict[str, type[CompressionStrategy]] = {
    "basic": BasicStrategy,
    "aggressive": AggressiveStrategy,
    "ast_based": ASTBasedStrategy,
    "component_ref": ComponentRefStrategy,
}


def get_strategy(name: str, **kwargs) -> CompressionStrategy:
    """
    Factory function to get a strategy by name.

    Args:
        name: Strategy name ("basic", "aggressive", "ast_based", "component_ref")
        **kwargs: Additional arguments to pass to strategy constructor

    Returns:
        Instantiated CompressionStrategy

    Raises:
        ValueError: If strategy name is unknown

    Example:
        >>> strategy = get_strategy("aggressive")
        >>> compressed = strategy.compress(dart_code)
    """
    name_lower = name.lower()

    if name_lower not in _STRATEGIES:
        available = list(_STRATEGIES.keys())
        raise ValueError(f"Unknown strategy: '{name}'. Available strategies: {available}")

    strategy_class = _STRATEGIES[name_lower]
    return strategy_class(**kwargs)


def register_strategy(name: str, strategy_class: type[CompressionStrategy]) -> None:
    """
    Register a custom strategy.

    Args:
        name: Unique strategy name
        strategy_class: Class that extends CompressionStrategy

    Example:
        >>> class MyCustomStrategy(CompressionStrategy):
        ...     # Implementation
        ...
        >>> register_strategy("custom", MyCustomStrategy)
    """
    _STRATEGIES[name.lower()] = strategy_class


def list_strategies() -> dict[str, str]:
    """
    List all available strategies with descriptions.

    Returns:
        Dictionary mapping strategy names to descriptions
    """
    result = {}
    for name, cls in _STRATEGIES.items():
        instance = cls()
        result[name] = instance.config.description
    return result


def get_strategy_config(name: str) -> Optional[StrategyConfig]:
    """
    Get configuration for a specific strategy.

    Args:
        name: Strategy name

    Returns:
        StrategyConfig or None if strategy not found
    """
    if name.lower() not in _STRATEGIES:
        return None

    strategy = get_strategy(name)
    return strategy.config


__all__ = [
    # Base classes
    "CompressionStrategy",
    "DecompressionStrategy",
    "StrategyConfig",
    # Concrete strategies
    "BasicStrategy",
    "AggressiveStrategy",
    "ASTBasedStrategy",
    "ComponentRefStrategy",
    # Selector
    "StrategySelector",
    "StrategyName",
    "StrategyMetrics",
    # Factory functions
    "get_strategy",
    "register_strategy",
    "list_strategies",
    "get_strategy_config",
]
