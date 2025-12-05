"""
Data access layer for COON compression.

This module loads abbreviation data from the shared spec/ directory,
ensuring all SDKs use the same mappings (Single Source of Truth).

The module now supports language-specific data from spec/languages/<lang>/
with fallback to spec/data/ for backwards compatibility.
"""

import json
from functools import lru_cache
from pathlib import Path

# Default language for backwards compatibility
_DEFAULT_LANGUAGE = "dart"

# Cache for spec paths
_spec_path_cache: dict[str, Path] = {}


def _find_project_root() -> Path:
    """Find the COON project root directory."""
    # Try from this file's location first
    current = Path(__file__).parent
    for _ in range(10):  # Traverse up to 10 levels
        if (current / "spec").exists():
            return current
        parent = current.parent
        if parent == current:
            break
        current = parent

    # Fallback: try from cwd
    cwd_path = Path.cwd()
    for parent in [cwd_path] + list(cwd_path.parents):
        if (parent / "spec").exists():
            return parent

    raise FileNotFoundError(
        "Could not find COON project root (directory containing 'spec/'). "
        "Ensure you're running from within the COON project."
    )


def _get_language_data_path(language: str = _DEFAULT_LANGUAGE) -> Path:
    """
    Get the path to language-specific data directory.

    First tries spec/languages/<language>/, then falls back to spec/data/.

    Args:
        language: Language identifier (e.g., "dart", "python").

    Returns:
        Path to the data directory.
    """
    cache_key = f"lang_{language}"
    if cache_key in _spec_path_cache:
        return _spec_path_cache[cache_key]

    root = _find_project_root()

    # Try new language-specific path first
    lang_path = root / "spec" / "languages" / language
    if lang_path.exists():
        _spec_path_cache[cache_key] = lang_path
        return lang_path

    # Fallback to old spec/data path
    old_path = root / "spec" / "data"
    if old_path.exists():
        _spec_path_cache[cache_key] = old_path
        return old_path

    raise FileNotFoundError(
        f"Could not find spec data for language '{language}'. Tried: {lang_path} and {old_path}"
    )


def _get_spec_data_path() -> Path:
    """Get the path to spec/data directory (backwards compatibility)."""
    return _get_language_data_path(_DEFAULT_LANGUAGE)


def _load_json(filename: str) -> dict:
    """Load JSON file from spec/data directory."""
    path = _get_spec_data_path() / filename
    if not path.exists():
        raise FileNotFoundError(f"Spec data file not found: {path}")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def get_widgets() -> dict[str, str]:
    """
    Get widget abbreviations.

    Returns:
        Dictionary mapping full widget names to abbreviations.
        Example: {"Scaffold": "S", "Column": "C", ...}
    """
    data = _load_json("widgets.json")
    return data.get("abbreviations", {})


@lru_cache(maxsize=1)
def get_properties() -> dict[str, str]:
    """
    Get property abbreviations.

    Returns:
        Dictionary mapping full property names to abbreviations.
        Example: {"appBar:": "a:", "body:": "b:", ...}
    """
    data = _load_json("properties.json")
    return data.get("abbreviations", {})


@lru_cache(maxsize=1)
def get_keywords() -> dict[str, str]:
    """
    Get keyword abbreviations.

    Returns:
        Dictionary mapping full keywords to abbreviations.
        Example: {"class": "c:", "final": "f:", ...}
    """
    data = _load_json("keywords.json")
    return data.get("abbreviations", {})


def get_all_abbreviations() -> dict[str, dict[str, str]]:
    """
    Get all abbreviation dictionaries.

    Returns:
        Dictionary with keys 'widgets', 'properties', 'keywords',
        each containing the respective abbreviation mappings.
    """
    return {"widgets": get_widgets(), "properties": get_properties(), "keywords": get_keywords()}


def get_reverse_widgets() -> dict[str, str]:
    """
    Get reverse widget mappings (abbreviation -> full name).

    Returns:
        Dictionary mapping abbreviations to full widget names.
        Example: {"S": "Scaffold", "C": "Column", ...}
    """
    return {v: k for k, v in get_widgets().items()}


def get_reverse_properties() -> dict[str, str]:
    """
    Get reverse property mappings (abbreviation -> full name).

    Returns:
        Dictionary mapping abbreviations to full property names.
        Example: {"a:": "appBar:", "b:": "body:", ...}
    """
    return {v: k for k, v in get_properties().items()}


def get_reverse_keywords() -> dict[str, str]:
    """
    Get reverse keyword mappings (abbreviation -> full keyword).

    Returns:
        Dictionary mapping abbreviations to full keywords.
        Example: {"c:": "class", "f:": "final", ...}
    """
    return {v: k for k, v in get_keywords().items()}


def clear_cache():
    """Clear all cached data. Useful for testing or after updating spec files."""
    get_widgets.cache_clear()
    get_properties.cache_clear()
    get_keywords.cache_clear()


# Version info from data files
def get_data_version() -> dict[str, str]:
    """Get version information from all data files."""
    return {
        "widgets": _load_json("widgets.json").get("version", "unknown"),
        "properties": _load_json("properties.json").get("version", "unknown"),
        "keywords": _load_json("keywords.json").get("version", "unknown"),
    }
