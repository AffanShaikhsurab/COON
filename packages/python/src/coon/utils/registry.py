"""
Component registry for custom widget compression.
"""

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Optional


@dataclass
class Component:
    """
    Represents a reusable component.

    Components can be registered and referenced in compressed code
    to achieve higher compression ratios for repeated patterns.

    Attributes:
        id: Unique component identifier
        name: Human-readable name
        code: Component source code
        parameters: List of parameter names
        description: Component description
        category: Component category
        tags: List of tags for organization
        version: Component version
        token_count: Estimated token count
        compressed_ref: Compressed reference format
    """

    id: str
    name: str
    code: str
    parameters: list[str]
    description: str
    category: str
    tags: list[str]
    version: str
    token_count: int
    compressed_ref: str

    def matches(self, code: str, tolerance: float = 0.85) -> bool:
        """
        Check if code matches this component.

        Args:
            code: Code to match against
            tolerance: Minimum similarity threshold

        Returns:
            True if code matches within tolerance
        """
        similarity = self._calculate_similarity(code)
        return similarity >= tolerance

    def _calculate_similarity(self, code: str) -> float:
        """Calculate similarity score."""
        norm_component = self._normalize(self.code)
        norm_code = self._normalize(code)

        # Token-based Jaccard similarity
        tokens_comp = set(norm_component.split())
        tokens_code = set(norm_code.split())

        if not tokens_comp or not tokens_code:
            return 0.0

        intersection = tokens_comp.intersection(tokens_code)
        union = tokens_comp.union(tokens_code)

        return len(intersection) / len(union) if union else 0.0

    def _normalize(self, code: str) -> str:
        """Normalize code for comparison."""
        normalized = code.lower()
        normalized = " ".join(normalized.split())
        return normalized

    def compress_reference(self, params: Optional[dict[str, str]] = None) -> str:
        """
        Generate compressed reference.

        Args:
            params: Optional parameter values to include

        Returns:
            Compressed reference string
        """
        if params:
            param_str = ",".join(f"{k}={v}" for k, v in params.items())
            return f"#{self.compressed_ref}{{{param_str}}}"
        return f"#{self.compressed_ref}"

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


class ComponentRegistry:
    """
    Registry for managing custom components.

    Allows registration of reusable code components that can be
    referenced in compressed code for better compression ratios.

    Example:
        >>> registry = ComponentRegistry("components.json")
        >>> registry.register_component(
        ...     id="app_button",
        ...     name="AppButton",
        ...     code="ElevatedButton(child: Text(''), onPressed: (){})"
        ... )
        >>> matched = registry.find_matching_component(some_code)
    """

    def __init__(self, registry_file: Optional[str] = None):
        """
        Initialize the registry.

        Args:
            registry_file: Optional path to registry JSON file
        """
        self.components: dict[str, Component] = {}
        self.registry_file = registry_file

        if registry_file and Path(registry_file).exists():
            self.load_from_file(registry_file)

    def register_component(
        self,
        id: str,
        name: str,
        code: str,
        parameters: Optional[list[str]] = None,
        description: str = "",
        category: str = "general",
        tags: Optional[list[str]] = None,
        version: str = "1.0.0",
    ) -> Component:
        """
        Register a new component.

        Args:
            id: Unique component identifier
            name: Human-readable name
            code: Component source code
            parameters: List of parameter names
            description: Component description
            category: Component category
            tags: List of tags
            version: Component version

        Returns:
            Registered Component
        """
        if parameters is None:
            parameters = []
        if tags is None:
            tags = []

        # Calculate token count (rough estimate)
        token_count = len(code) // 4

        # Generate compressed reference
        compressed_ref = f"C_{id.upper()}"

        component = Component(
            id=id,
            name=name,
            code=code,
            parameters=parameters,
            description=description,
            category=category,
            tags=tags,
            version=version,
            token_count=token_count,
            compressed_ref=compressed_ref,
        )

        self.components[id] = component
        return component

    def unregister_component(self, id: str) -> bool:
        """
        Unregister a component.

        Args:
            id: Component ID to remove

        Returns:
            True if component was removed
        """
        if id in self.components:
            del self.components[id]
            return True
        return False

    def get_component(self, id: str) -> Optional[Component]:
        """
        Get component by ID.

        Args:
            id: Component ID

        Returns:
            Component or None if not found
        """
        return self.components.get(id)

    def find_matching_component(self, code: str, tolerance: float = 0.85) -> Optional[Component]:
        """
        Find best matching component for given code.

        Args:
            code: Code to match
            tolerance: Minimum similarity threshold

        Returns:
            Best matching component or None
        """
        best_match: Optional[Component] = None
        best_score = tolerance

        for component in self.components.values():
            if component.matches(code, tolerance):
                score = component._calculate_similarity(code)
                if score > best_score:
                    best_score = score
                    best_match = component

        return best_match

    def find_components_by_category(self, category: str) -> list[Component]:
        """
        Find all components in a category.

        Args:
            category: Category name

        Returns:
            List of matching components
        """
        return [c for c in self.components.values() if c.category.lower() == category.lower()]

    def find_components_by_tag(self, tag: str) -> list[Component]:
        """
        Find all components with a tag.

        Args:
            tag: Tag to search for

        Returns:
            List of matching components
        """
        return [c for c in self.components.values() if tag.lower() in [t.lower() for t in c.tags]]

    def list_components(self) -> list[Component]:
        """Get all registered components."""
        return list(self.components.values())

    def list_categories(self) -> list[str]:
        """Get all unique categories."""
        return list({c.category for c in self.components.values()})

    def save_to_file(self, filepath: Optional[str] = None):
        """
        Save registry to JSON file.

        Args:
            filepath: Path to save to. Uses registry_file if not provided.
        """
        target_path = filepath or self.registry_file
        if not target_path:
            raise ValueError("No file path specified")

        data = {"version": "1.0.0", "components": [c.to_dict() for c in self.components.values()]}

        # Ensure directory exists
        Path(target_path).parent.mkdir(parents=True, exist_ok=True)

        with open(target_path, "w") as f:
            json.dump(data, f, indent=2)

    def load_from_file(self, filepath: Optional[str] = None):
        """
        Load registry from JSON file.

        Args:
            filepath: Path to load from. Uses registry_file if not provided.
        """
        target_path = filepath or self.registry_file
        if not target_path:
            raise ValueError("No file path specified")

        with open(target_path) as f:
            data = json.load(f)

        self.components.clear()
        for comp_data in data.get("components", []):
            component = Component(**comp_data)
            self.components[component.id] = component

    def clear(self):
        """Clear all registered components."""
        self.components.clear()

    def get_stats(self) -> dict[str, Any]:
        """Get registry statistics."""
        components = list(self.components.values())

        return {
            "total_components": len(components),
            "total_categories": len(self.list_categories()),
            "total_token_savings_potential": sum(c.token_count for c in components),
            "categories": self.list_categories(),
        }
