#!/usr/bin/env python3
"""
COON CLI - Command-line interface for COON compression.

DEPRECATED: This CLI is deprecated. Please use the standalone @coon/cli package instead.
Install with: npm install -g @coon/cli

Usage:
    coon compress input.dart [-o output.coon] [-s strategy]
    coon decompress input.coon [-o output.dart]
    coon analyze input.dart
    coon stats input.dart
    coon validate input.dart
"""

import sys
import warnings
from pathlib import Path
from typing import Optional

# Show deprecation warning
warnings.warn(
    "The Python CLI (coon-py) is deprecated. "
    "Please use the standalone @coon/cli package instead.\n"
    "Install with: npm install -g @coon/cli",
    DeprecationWarning,
    stacklevel=2,
)

try:
    import click
except ImportError:
    print("Error: click is required for CLI. Install with: pip install click", file=sys.stderr)
    sys.exit(1)


@click.group()
@click.version_option(version="1.0.0", prog_name="coon")
def cli():
    """
    COON: Code-Oriented Object Notation

    Token-efficient compression for Dart/Flutter code.
    Achieve 60-70% token reduction for LLM contexts.

    Examples:

        coon compress app.dart -o app.coon

        coon decompress app.coon -o app.dart

        coon analyze app.dart
    """
    pass


@cli.command()
@click.argument("input_file", type=click.Path(exists=True))
@click.option("-o", "--output", type=click.Path(), help="Output file (default: stdout)")
@click.option(
    "-s",
    "--strategy",
    type=click.Choice(["auto", "basic", "aggressive", "ast_based", "component_ref"]),
    default="auto",
    help="Compression strategy",
)
@click.option("--validate/--no-validate", default=False, help="Validate compression result")
@click.option("--analyze/--no-analyze", default=False, help="Include code analysis")
def compress(input_file: str, output: Optional[str], strategy: str, validate: bool, analyze: bool):
    """Compress Dart code to COON format."""
    from ..core import Compressor

    # Read input file
    input_path = Path(input_file)
    dart_code = input_path.read_text(encoding="utf-8")

    # Compress
    compressor = Compressor()
    result = compressor.compress(
        dart_code, strategy=strategy, analyze_code=analyze, validate=validate
    )

    # Show stats
    click.echo(click.style("✅ Compressed successfully!", fg="green"), err=True)
    click.echo(f"📊 Original tokens: {result.original_tokens}", err=True)
    click.echo(f"📊 Compressed tokens: {result.compressed_tokens}", err=True)
    click.echo(f"💰 Compression ratio: {result.percentage_saved:.1f}%", err=True)
    click.echo(f"⚡ Token savings: {result.token_savings}", err=True)
    click.echo(f"🎯 Strategy used: {result.strategy_used}", err=True)

    # Write output
    if output:
        output_path = Path(output)
        output_path.write_text(result.compressed_code, encoding="utf-8")
        click.echo(f"📁 Saved to: {output}", err=True)
    else:
        click.echo(result.compressed_code)


@cli.command()
@click.argument("input_file", type=click.Path(exists=True))
@click.option("-o", "--output", type=click.Path(), help="Output file (default: stdout)")
@click.option("--format/--no-format", default=True, help="Format output code")
def decompress(input_file: str, output: Optional[str], format: bool):
    """Decompress COON format back to Dart."""
    from ..core import Decompressor

    # Read input file
    input_path = Path(input_file)
    coon_code = input_path.read_text(encoding="utf-8")

    # Decompress
    decompressor = Decompressor()
    dart_code = decompressor.decompress(coon_code, format_output=format)

    click.echo(click.style("✅ Decompressed successfully!", fg="green"), err=True)

    # Write output
    if output:
        output_path = Path(output)
        output_path.write_text(dart_code, encoding="utf-8")
        click.echo(f"📁 Saved to: {output}", err=True)
    else:
        click.echo(dart_code)


@cli.command()
@click.argument("input_file", type=click.Path(exists=True))
def analyze(input_file: str):
    """Analyze Dart code for compression opportunities."""
    from ..analysis import CodeAnalyzer

    # Read file
    input_path = Path(input_file)
    dart_code = input_path.read_text(encoding="utf-8")

    # Analyze
    analyzer = CodeAnalyzer()
    result = analyzer.analyze(dart_code)

    # Generate and display report
    report = analyzer.generate_report(result)
    click.echo(report)


@cli.command()
@click.argument("input_file", type=click.Path(exists=True))
def stats(input_file: str):
    """Show compression statistics for a Dart file."""
    from ..core import Compressor

    # Read file
    input_path = Path(input_file)
    dart_code = input_path.read_text(encoding="utf-8")

    # Compress with all strategies and compare
    compressor = Compressor()
    strategies = ["basic", "aggressive", "ast_based"]

    click.echo("=" * 70)
    click.echo("COON COMPRESSION STATISTICS")
    click.echo("=" * 70)
    click.echo(f"\n📄 File: {input_file}")
    click.echo(f"📏 Original size: {len(dart_code)} characters")
    click.echo(f"🔢 Original tokens: {len(dart_code) // 4}")

    click.echo("\n📊 Strategy Comparison:")
    click.echo("-" * 50)

    best_strategy = None
    best_ratio = 0

    for strategy in strategies:
        result = compressor.compress(dart_code, strategy=strategy)

        click.echo(f"\n  {strategy.upper()}:")
        click.echo(f"    Tokens: {result.original_tokens} → {result.compressed_tokens}")
        click.echo(f"    Savings: {result.token_savings} tokens ({result.percentage_saved:.1f}%)")
        click.echo(f"    Time: {result.processing_time_ms:.2f}ms")

        if result.compression_ratio > best_ratio:
            best_ratio = result.compression_ratio
            best_strategy = strategy

    click.echo("\n" + "-" * 50)
    click.echo(f"\n🏆 Best strategy: {best_strategy.upper()} ({best_ratio * 100:.1f}% savings)")

    # Cost impact
    tokens_saved = int(len(dart_code) // 4 * best_ratio)
    input_cost_saved = (tokens_saved / 1000) * 0.03
    output_cost_saved = (tokens_saved / 1000) * 0.06

    click.echo("\n💵 Cost Impact (GPT-4 pricing):")
    click.echo(f"   Input cost saved: ${input_cost_saved:.4f}")
    click.echo(f"   Output cost saved: ${output_cost_saved:.4f}")
    click.echo(f"   Total per call: ${input_cost_saved + output_cost_saved:.4f}")
    click.echo()


@cli.command()
@click.argument("input_file", type=click.Path(exists=True))
@click.option("--strict/--no-strict", default=False, help="Use strict validation mode")
def validate(input_file: str, strict: bool):
    """Validate compression round-trip for a Dart file."""
    from ..core import Compressor, Decompressor
    from ..utils import CompressionValidator

    # Read file
    input_path = Path(input_file)
    dart_code = input_path.read_text(encoding="utf-8")

    # Compress
    compressor = Compressor()
    result = compressor.compress(dart_code, strategy="auto")

    # Decompress
    decompressor = Decompressor()
    decompressed = decompressor.decompress(result.compressed_code)

    # Validate
    validator = CompressionValidator(strict_mode=strict)
    validation = validator.validate_compression(dart_code, result.compressed_code, decompressed)

    click.echo("=" * 70)
    click.echo("COMPRESSION VALIDATION REPORT")
    click.echo("=" * 70)

    if validation.is_valid:
        click.echo(click.style("\n✅ Validation PASSED", fg="green", bold=True))
    else:
        click.echo(click.style("\n❌ Validation FAILED", fg="red", bold=True))

    click.echo("\n📊 Results:")
    click.echo(f"   Reversible: {'✓' if validation.reversible else '✗'}")
    click.echo(f"   Semantic equivalent: {'✓' if validation.semantic_equivalent else '✗'}")
    click.echo(f"   Token count valid: {'✓' if validation.token_count_match else '✗'}")
    click.echo(f"   Similarity score: {validation.similarity_score:.2%}")

    if validation.errors:
        click.echo(click.style("\n❌ Errors:", fg="red"))
        for error in validation.errors:
            click.echo(f"   - {error}")

    if validation.warnings:
        click.echo(click.style("\n⚠️  Warnings:", fg="yellow"))
        for warning in validation.warnings:
            click.echo(f"   - {warning}")

    click.echo()

    # Exit with error code if validation failed
    if not validation.is_valid:
        sys.exit(1)


@cli.command()
@click.option("--metrics-file", type=click.Path(), help="Metrics JSON file")
def report(metrics_file: Optional[str]):
    """Generate metrics report from collected data."""
    from ..analysis import MetricsCollector

    if not metrics_file:
        click.echo("No metrics file specified. Use --metrics-file to provide one.", err=True)
        sys.exit(1)

    metrics_path = Path(metrics_file)
    if not metrics_path.exists():
        click.echo(f"Metrics file not found: {metrics_file}", err=True)
        sys.exit(1)

    collector = MetricsCollector(storage_path=metrics_file)
    collector.load()

    report = collector.generate_report()
    click.echo(report)


def main():
    """Main entry point."""
    cli()


if __name__ == "__main__":
    main()
