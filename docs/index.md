---
layout: home
title: COON - Code-Oriented Object Notation
titleTemplate: Token-Efficient Code Compression

hero:
  name: COON
  text: Code-Oriented Object Notation
  tagline: Token-efficient compression format for Dart/Flutter code, optimized for LLM contexts. Achieve 60-70% token reduction with lossless round-trip compression.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/AffanShaikhsurab/COON

features:
  - icon: 📊
    title: Token-Efficient
    details: Achieve 60-70% token reduction through systematic abbreviation of keywords, widgets, and properties.
  - icon: 🔁
    title: Lossless Round-Trip
    details: Full semantic preservation with deterministic compression and decompression.
  - icon: 🎯
    title: Multiple Strategies
    details: Six compression strategies optimized for different code patterns and use cases.
  - icon: 🌐
    title: Multi-Language SDKs
    details: Official implementations in Python and JavaScript/TypeScript with shared specification.
  - icon: 💻
    title: Cross-Platform CLI
    details: Command-line tool for quick conversions, analysis, and validation.
  - icon: 📋
    title: Spec-Driven
    details: Formal specification ensures consistent behavior across all implementations.
---

## Why COON?

When working with Large Language Models for code generation, token efficiency directly impacts cost and context utilization:

- **Context Windows**: LLMs have finite context windows that fill quickly with verbose code
- **API Costs**: Token count directly correlates with API pricing
- **Multi-Agent Systems**: Agents passing code between each other multiply token overhead
- **Response Quality**: More context space for examples improves generation quality

## Quick Example

**Standard Dart code** (verbose):

```dart
class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Login")),
      body: Center(child: Text("Welcome")),
    );
  }
}
```

**COON format** (65% fewer tokens):

```
c:LoginScreen<StatelessWidget>;m:b S{a:B{t:T"Login"},b:N{c:T"Welcome"}}
```

## Installation

::: code-group

```bash [npm]
npm install coon-format
```

```bash [pip]
pip install coon
```

```bash [npx (no install)]
npx @coon/cli compress app.dart
```

:::

## Token Savings

| Test Case | Original | Compressed | Reduction |
|-----------|----------|------------|-----------|
| Simple Widget | 33 tokens | 13 tokens | 60.6% |
| Login Screen | 405 tokens | 121 tokens | 70.1% |
| List View | 165 tokens | 78 tokens | 52.7% |
| **Average** | - | - | **61.3%** |
