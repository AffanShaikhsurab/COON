"""
Loader utilities for spec data.

Provides helper functions for loading and validating spec data files.
"""

import json
from typing import Any


def load_fixtures(fixture_name: str) -> list[dict[str, Any]]:
    """
    Load conformance test fixtures from spec/fixtures/conformance/.

    Args:
        fixture_name: Name of the fixture file (e.g., "basic_compression.json")

    Returns:
        List of test case dictionaries.
    """
    from . import _get_spec_data_path

    spec_path = _get_spec_data_path()
    fixtures_path = spec_path.parent / "fixtures" / "conformance" / fixture_name

    if not fixtures_path.exists():
        raise FileNotFoundError(f"Fixture file not found: {fixtures_path}")

    with open(fixtures_path, encoding="utf-8") as f:
        data = json.load(f)

    return data.get("testCases", [])


def load_all_fixtures() -> dict[str, list[dict[str, Any]]]:
    """
    Load all conformance test fixtures.

    Returns:
        Dictionary mapping fixture names to their test cases.
    """
    from . import _get_spec_data_path

    spec_path = _get_spec_data_path()
    fixtures_dir = spec_path.parent / "fixtures" / "conformance"

    if not fixtures_dir.exists():
        return {}

    fixtures = {}
    for fixture_file in fixtures_dir.glob("*.json"):
        with open(fixture_file, encoding="utf-8") as f:
            data = json.load(f)
        fixtures[fixture_file.stem] = data.get("testCases", [])

    return fixtures


def validate_data_integrity() -> dict[str, Any]:
    """
    Validate the integrity of spec data files.

    Returns:
        Dictionary with validation results.
    """
    from . import get_keywords, get_properties, get_widgets

    issues = []
    warnings = []

    # Check for duplicate abbreviations
    widgets = get_widgets()
    properties = get_properties()
    keywords = get_keywords()

    # Check widget abbreviations for uniqueness
    widget_abbrevs = list(widgets.values())
    if len(widget_abbrevs) != len(set(widget_abbrevs)):
        issues.append("Duplicate widget abbreviations found")

    # Check property abbreviations for uniqueness
    prop_abbrevs = list(properties.values())
    if len(prop_abbrevs) != len(set(prop_abbrevs)):
        issues.append("Duplicate property abbreviations found")

    # Check for conflicts between categories
    all_abbrevs = set(widget_abbrevs) | set(prop_abbrevs) | set(keywords.values())
    if len(all_abbrevs) < len(widget_abbrevs) + len(prop_abbrevs) + len(keywords):
        warnings.append("Some abbreviations are shared across categories")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
        "counts": {
            "widgets": len(widgets),
            "properties": len(properties),
            "keywords": len(keywords),
        },
    }
