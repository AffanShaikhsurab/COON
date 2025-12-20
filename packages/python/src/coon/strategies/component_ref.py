"""
Component reference compression strategy.

Replaces known components with references from a registry.
Achieves highest compression for component-heavy code.
"""

from typing import Optional
from .base import CompressionStrategy, StrategyConfig
from .aggressive import AggressiveStrategy


class ComponentRefStrategy(CompressionStrategy):
    """
    Component reference compression strategy.
    
    Looks up code patterns in a component registry and replaces
    them with short references. Best for code that uses
    common, reusable components.
    
    Expected compression ratio: 70-80%
    """
    
    def __init__(self, registry=None, language: str = "dart"):
        """
        Initialize with optional component registry.
        
        Args:
            registry: ComponentRegistry instance for component lookup
            language: Language identifier (default: "dart")
        """
        super().__init__(language)
        self._registry = registry
        self._fallback = AggressiveStrategy(language)
    
    @property
    def name(self) -> str:
        return "component_ref"
    
    @property
    def config(self) -> StrategyConfig:
        return StrategyConfig(
            name="Component Reference",
            description="Replace known components with references from registry",
            min_code_size=200,
            max_code_size=None,
            expected_ratio=0.80,
            preserve_formatting=False,
            preserve_comments=False,
            aggressive_whitespace=True,
            widget_abbreviation=True,
            property_abbreviation=True,
            keyword_abbreviation=True,
            use_ast_analysis=True,
            use_component_registry=True,
            language=self._language,
            parameters={
                "component_threshold": 50,
                "match_tolerance": 0.85
            }
        )
    
    def set_registry(self, registry):
        """
        Set the component registry.
        
        Args:
            registry: ComponentRegistry instance
        """
        self._registry = registry
    
    def compress(self, code: str) -> str:
        """
        Apply component reference compression.
        
        Args:
            code: Raw Dart source code
            
        Returns:
            Compressed COON format string with component references
        """
        if not code or not code.strip():
            return ""
        
        if not self._registry:
            # No registry available, fall back to aggressive
            return self._fallback.compress(code)
        
        # Try to find matching component
        params = self.config.parameters
        tolerance = params.get("match_tolerance", 0.85) if params else 0.85
        component = self._registry.find_matching_component(code, tolerance=tolerance)
        
        if component:
            # Use component reference
            return component.compress_reference()
        
        # No matching component, fall back to aggressive
        return self._fallback.compress(code)
    
    def supports_code(self, code: str) -> bool:
        """
        Check if component ref strategy is suitable.
        
        Args:
            code: Dart source code to check
            
        Returns:
            True if registry is available and code is large enough
        """
        if len(code) < self.config.min_code_size:
            return False
        
        # Need registry for this strategy
        return self._registry is not None
