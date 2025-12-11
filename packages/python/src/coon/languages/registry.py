"""
Language handler registry.

Provides a central registry for language handlers, allowing dynamic
registration and automatic language detection from source code.
"""

from typing import Dict, Type, Optional, List
from .base import LanguageHandler


class LanguageRegistry:
    """
    Registry for language handlers.
    
    Allows dynamic registration of language handlers and
    automatic detection of language from code.
    
    This is implemented as a class with class methods to act as a singleton.
    
    Example:
        >>> from coon.languages import LanguageRegistry
        >>> # Get a specific language handler
        >>> dart = LanguageRegistry.get("dart")
        >>> # Auto-detect language
        >>> lang = LanguageRegistry.detect("class MyWidget extends StatelessWidget {}")
        >>> print(lang)  # "dart"
    """
    
    _handlers: Dict[str, Type[LanguageHandler]] = {}
    _instances: Dict[str, LanguageHandler] = {}
    
    @classmethod
    def register(cls, name: str, handler_class: Type[LanguageHandler]) -> None:
        """
        Register a language handler.
        
        Args:
            name: Language identifier (e.g., "dart", "python").
            handler_class: The LanguageHandler subclass to register.
        """
        cls._handlers[name.lower()] = handler_class
        # Clear cached instance if re-registering
        if name.lower() in cls._instances:
            del cls._instances[name.lower()]
    
    @classmethod
    def get(cls, name: str) -> LanguageHandler:
        """
        Get a language handler by name.
        
        Args:
            name: Language identifier.
            
        Returns:
            LanguageHandler instance.
            
        Raises:
            ValueError: If the language is not registered.
        """
        name = name.lower()
        if name not in cls._instances:
            if name not in cls._handlers:
                available = ", ".join(cls._handlers.keys()) or "none"
                raise ValueError(
                    f"Unknown language: '{name}'. Available languages: {available}"
                )
            cls._instances[name] = cls._handlers[name]()
        return cls._instances[name]
    
    @classmethod
    def detect(cls, code: str) -> Optional[str]:
        """
        Auto-detect language from source code.
        
        Runs detection on all registered handlers and returns
        the one with the highest confidence score.
        
        Args:
            code: Source code to analyze.
            
        Returns:
            Language name if detected with confidence > 0.5, else None.
        """
        if not cls._handlers:
            return None
        
        best_match: Optional[str] = None
        best_score: float = 0.0
        
        for name in cls._handlers.keys():
            handler = cls.get(name)
            score = handler.detect_language(code)
            if score > best_score:
                best_score = score
                best_match = name
        
        return best_match if best_score > 0.5 else None
    
    @classmethod
    def list_languages(cls) -> List[str]:
        """
        List all registered language names.
        
        Returns:
            List of registered language identifiers.
        """
        return list(cls._handlers.keys())
    
    @classmethod
    def is_registered(cls, name: str) -> bool:
        """
        Check if a language is registered.
        
        Args:
            name: Language identifier.
            
        Returns:
            True if the language is registered.
        """
        return name.lower() in cls._handlers
    
    @classmethod
    def clear(cls) -> None:
        """
        Clear all registered handlers.
        
        Primarily useful for testing.
        """
        cls._handlers.clear()
        cls._instances.clear()
    
    @classmethod
    def detect_from_extension(cls, extension: str) -> Optional[str]:
        """
        Detect language from file extension.
        
        Args:
            extension: File extension (e.g., ".dart", "py").
            
        Returns:
            Language name if found, else None.
        """
        ext = extension if extension.startswith('.') else f'.{extension}'
        
        for name in cls._handlers.keys():
            handler = cls.get(name)
            if handler.spec.supports_extension(ext):
                return name
        
        return None


def _register_default_languages() -> None:
    """Register built-in language handlers."""
    try:
        from .dart import DartLanguageHandler
        LanguageRegistry.register("dart", DartLanguageHandler)
    except ImportError:
        pass  # Dart handler not available
    
    try:
        from .javascript import JavaScriptHandler
        LanguageRegistry.register("javascript", JavaScriptHandler)
    except ImportError:
        pass  # JavaScript handler not available


# Auto-register default languages on module load
_register_default_languages()
