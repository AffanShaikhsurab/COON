"""
Component registry for custom widget compression
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import json
from pathlib import Path


@dataclass
class Component:
    """Represents a reusable component"""
    id: str
    name: str
    code: str
    parameters: List[str]
    description: str
    category: str
    tags: List[str]
    version: str
    token_count: int
    compressed_ref: str  # Compressed reference format
    
    def matches(self, code: str, tolerance: float = 0.85) -> bool:
        """Check if code matches this component"""
        # Calculate similarity
        similarity = self._calculate_similarity(code)
        return similarity >= tolerance
    
    def _calculate_similarity(self, code: str) -> float:
        """Calculate similarity score"""
        # Normalize both codes
        norm_component = self._normalize(self.code)
        norm_code = self._normalize(code)
        
        # Simple token-based similarity
        tokens_comp = set(norm_component.split())
        tokens_code = set(norm_code.split())
        
        if not tokens_comp or not tokens_code:
            return 0.0
        
        intersection = tokens_comp.intersection(tokens_code)
        union = tokens_comp.union(tokens_code)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _normalize(self, code: str) -> str:
        """Normalize code for comparison"""
        # Remove whitespace, lowercase
        normalized = code.lower()
        normalized = ' '.join(normalized.split())
        return normalized
    
    def compress_reference(self, params: Dict[str, str] = None) -> str:
        """Generate compressed reference"""
        if params:
            param_str = ','.join(f"{k}={v}" for k, v in params.items())
            return f"#{self.compressed_ref}{{{param_str}}}"
        return f"#{self.compressed_ref}"
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return asdict(self)


class ComponentRegistry:
    """Registry for managing custom components"""
    
    def __init__(self, registry_file: Optional[str] = None):
        self.components: Dict[str, Component] = {}
        self.registry_file = registry_file
        
        if registry_file and Path(registry_file).exists():
            self.load_from_file(registry_file)
    
    def register_component(
        self,
        id: str,
        name: str,
        code: str,
        parameters: List[str] = None,
        description: str = "",
        category: str = "general",
        tags: List[str] = None,
        version: str = "1.0.0"
    ) -> Component:
        """
        Register a new component
        
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
        
        # Calculate token count
        token_count = len(code) // 4  # Rough estimate
        
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
            compressed_ref=compressed_ref
        )
        
        self.components[id] = component
        return component
    
    def get_component(self, id: str) -> Optional[Component]:
        """Get component by ID"""
        return self.components.get(id)
    
    def find_matching_component(
        self,
        code: str,
        tolerance: float = 0.85
    ) -> Optional[Component]:
        """
        Find best matching component for given code
        
        Args:
            code: Code to match
            tolerance: Minimum similarity threshold
            
        Returns:
            Best matching component or None
        """
        best_match = None
        best_score = 0.0
        
        for component in self.components.values():
            if component.matches(code, tolerance):
                score = component._calculate_similarity(code)
                if score > best_score:
                    best_score = score
                    best_match = component
        
        return best_match
    
    def search_by_category(self, category: str) -> List[Component]:
        """Search components by category"""
        return [
            c for c in self.components.values()
            if c.category == category
        ]
    
    def search_by_tags(self, tags: List[str]) -> List[Component]:
        """Search components by tags"""
        return [
            c for c in self.components.values()
            if any(tag in c.tags for tag in tags)
        ]
    
    def search_by_name(self, name: str) -> List[Component]:
        """Search components by name (partial match)"""
        name_lower = name.lower()
        return [
            c for c in self.components.values()
            if name_lower in c.name.lower()
        ]
    
    def save_to_file(self, filepath: Optional[str] = None):
        """Save registry to JSON file"""
        target_file = filepath or self.registry_file
        if not target_file:
            raise ValueError("No file path specified")
        
        data = {
            'version': '1.0.0',
            'components': {
                comp_id: comp.to_dict()
                for comp_id, comp in self.components.items()
            }
        }
        
        with open(target_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_from_file(self, filepath: str):
        """Load registry from JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        components_data = data.get('components', {})
        for comp_id, comp_data in components_data.items():
            component = Component(**comp_data)
            self.components[comp_id] = component
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get registry statistics"""
        categories = {}
        for component in self.components.values():
            categories[component.category] = categories.get(component.category, 0) + 1
        
        total_tokens = sum(c.token_count for c in self.components.values())
        
        return {
            'total_components': len(self.components),
            'categories': categories,
            'total_tokens': total_tokens,
            'avg_tokens_per_component': total_tokens // len(self.components) if self.components else 0
        }
    
    def export_component(self, component_id: str, filepath: str):
        """Export single component to file"""
        component = self.get_component(component_id)
        if not component:
            raise ValueError(f"Component {component_id} not found")
        
        with open(filepath, 'w') as f:
            json.dump(component.to_dict(), f, indent=2)
    
    def import_component(self, filepath: str) -> Component:
        """Import component from file"""
        with open(filepath, 'r') as f:
            comp_data = json.load(f)
        
        component = Component(**comp_data)
        self.components[component.id] = component
        return component
    
    def delete_component(self, component_id: str) -> bool:
        """Delete component from registry"""
        if component_id in self.components:
            del self.components[component_id]
            return True
        return False
    
    def list_all_components(self) -> List[Component]:
        """List all registered components"""
        return list(self.components.values())
    
    def clear(self):
        """Clear all components"""
        self.components.clear()


# Helper function for creating default registry
def create_default_registry() -> ComponentRegistry:
    """Create registry with common Flutter components"""
    registry = ComponentRegistry()
    
    # Email Input Component
    registry.register_component(
        id="email_input",
        name="Email Input Field",
        code="""TextField(
  controller: controller,
  decoration: InputDecoration(
    labelText: "Email",
    hintText: "you@example.com",
    prefixIcon: Icon(Icons.email),
    border: OutlineInputBorder(),
  ),
  keyboardType: TextInputType.emailAddress,
)""",
        parameters=["controller"],
        description="Standard email input field with validation",
        category="forms",
        tags=["input", "email", "form", "validation"]
    )
    
    # Password Input Component
    registry.register_component(
        id="password_input",
        name="Password Input Field",
        code="""TextField(
  controller: controller,
  obscureText: true,
  decoration: InputDecoration(
    labelText: "Password",
    prefixIcon: Icon(Icons.lock),
    border: OutlineInputBorder(),
  ),
)""",
        parameters=["controller"],
        description="Password input field with masking",
        category="forms",
        tags=["input", "password", "form", "security"]
    )
    
    # Primary Button Component
    registry.register_component(
        id="primary_button",
        name="Primary Action Button",
        code="""ElevatedButton(
  onPressed: onPressed,
  style: ElevatedButton.styleFrom(
    minimumSize: Size(double.infinity, 50),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8),
    ),
  ),
  child: Text(label),
)""",
        parameters=["onPressed", "label"],
        description="Full-width primary action button",
        category="buttons",
        tags=["button", "action", "primary"]
    )
    
    return registry
