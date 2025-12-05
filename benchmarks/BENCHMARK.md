# COON Compression Benchmark Report

> **Comprehensive analysis of COON's token efficiency and LLM comprehension accuracy**
> 
> **Benchmark Date**: December 5, 2025

## Executive Summary

COON (Compressed Object-Oriented Notation) is a compression format for Dart/Flutter code that reduces token count while maintaining semantic readability for Large Language Models. This benchmark evaluates COON's effectiveness across multiple LLM providers.

### Key Findings

| Metric | Value |
|--------|-------|
| **Token Reduction** | ~30% (28-33% across samples) |
| **Average Dart Tokens** | 4,691 tokens |
| **Average COON Tokens** | 3,239 tokens |
| **Accuracy (Dart Baseline)** | 54.2% |
| **Accuracy (COON + Context)** | 54.2% |
| **Accuracy (Raw COON)** | 52.1% |
| **Compression Ratio** | ~1.45x |
| **Best COON Model** | GLM-4.6 (62.5% accuracy) |

---

## Benchmark Configuration

### Test Environment
- **Date**: December 5, 2025
- **Compression Strategy**: `COMPONENT_REF`
- **Test Samples**: 
  - E-Commerce Product Listing App (~900 lines)
  - Social Media Feed Application (~1,100 lines)
- **Questions per Sample**: 8 code comprehension questions
- **Total Tests**: 144 (2 samples × 3 scenarios × 3 models × 8 questions)

### Models Tested

| Provider | Model | Input Cost (per 1M tokens) | Best For |
|----------|-------|----------------------------|----------|
| **Google** | Gemini 2.5 Flash | $0.30 | Fast responses |
| **Z.AI** | GLM-4.6 | ~$0.15* | Best COON comprehension |
| **MiniMax** | MiniMax-M2 | $0.30 | Thorough analysis |

*Z.AI pricing estimated based on regional API

---

## Accuracy Results

### Overall Model Rankings

| Rank | Model | Dart Accuracy | COON (Raw) | COON + Context | Best For |
|------|-------|---------------|------------|----------------|----------|
| 🥇 1 | **GLM-4.6 (Z.AI)** | 62.5% | 56.25% | **62.5%** | Best COON comprehension |
| 🥈 2 | **Gemini 2.5 Flash** | 50.0% | 50.0% | 50.0% | Consistent across formats |
| 🥉 3 | **MiniMax-M2** | 50.0% | 50.0% | 50.0% | Thorough reasoning |

### E-Commerce Product Listing App

| Model | Dart Baseline | Raw COON | COON + Context |
|-------|---------------|----------|----------------|
| Gemini 2.5 Flash | 50.0% (4/8) | 50.0% (4/8) | 50.0% (4/8) |
| GLM-4.6 | **62.5% (5/8)** | 50.0% (4/8) | **62.5% (5/8)** |
| MiniMax-M2 | 50.0% (4/8) | 50.0% (4/8) | 50.0% (4/8) |

### Social Media Feed Application

| Model | Dart Baseline | Raw COON | COON + Context |
|-------|---------------|----------|----------------|
| Gemini 2.5 Flash | 50.0% (4/8) | 50.0% (4/8) | 50.0% (4/8) |
| GLM-4.6 | **62.5% (5/8)** | **62.5% (5/8)** | **62.5% (5/8)** |
| MiniMax-M2 | 50.0% (4/8) | 50.0% (4/8) | 50.0% (4/8) |

### Question-Level Analysis

#### Questions Where All Models Succeeded ✅

| Question Type | Example | Success Rate |
|---------------|---------|-------------|
| Boolean Detection | "Does code contain Scaffold?" | **100%** |
| Boolean Detection | "Is there StatefulWidget?" | **100%** |
| Boolean Detection | "Does code contain navigation?" | **100%** |
| String Extraction | "What is the AppBar title?" | **100%** |

#### Questions Where Models Struggled ❌

| Question Type | Example | Success Rate | Issue |
|---------------|---------|--------------|-------|
| Widget Counting | "How many widget types?" | **0%** | Over-counting in all formats |
| Root Widget ID | "Main root widget class?" | **0%** | Returned class name, not widget |
| Multi-Answer | "ListView or GridView?" | **33%** | Failed to answer "BOTH" |
| Text Widget Count | "Count Text widgets" | **0%** | Inconsistent counting |

---

## Token Efficiency Analysis

### Compression Results

| Sample | Dart Tokens | COON Tokens | COON + Context Tokens | Reduction | Compression Ratio |
|--------|-------------|-------------|----------------------|-----------|-------------------|
| E-Commerce App | 5,087 | 3,403 | 3,515 | **-33.1%** | **1.49x** |
| Social Media App | 4,294 | 3,075 | 3,187 | **-28.4%** | **1.40x** |
| **Average** | **4,691** | **3,239** | **3,351** | **-30.9%** | **1.45x** |

### Cost Savings Projection

Based on typical API pricing ($0.15/1M input tokens):

| Sample | Dart Cost | COON Cost | Savings per Request |
|--------|-----------|-----------|---------------------|
| E-Commerce App | $0.000763 | $0.000510 | **$0.000253 (33.1%)** |
| Social Media App | $0.000644 | $0.000461 | **$0.000183 (28.4%)** |

**At Scale (1M requests):**
- E-Commerce App: **$253** saved
- Social Media App: **$183** saved

---

## Performance Metrics

### Latency & Response Times (Average ms per question)

| Model | Dart Baseline | Raw COON | COON + Context |
|-------|---------------|----------|----------------|
| Gemini 2.5 Flash | 4,683 ms | 7,213 ms | 5,445 ms |
| **GLM-4.6** | **4,674 ms** | **2,652 ms** | **2,092 ms** |
| MiniMax-M2 | 9,897 ms | 23,216 ms | 26,248 ms |

**Best Performer:** GLM-4.6 - 2x faster on COON than Dart!

### Token Generation Efficiency (Total Output Tokens per Sample)

| Model | Dart Baseline | Raw COON | COON + Context |
|-------|---------------|----------|----------------|
| Gemini 2.5 Flash | 13 | 13-16 | 13-16 |
| GLM-4.6 | 52 | 51-52 | 51-52 |
| MiniMax-M2 | 3,998-5,812 | 11,243-16,085 | 10,013-16,914 |

**Note:** MiniMax-M2 generates significantly more output tokens (verbose reasoning), leading to higher latency and output costs.

---

## Model Recommendations

### Best Model for COON Comprehension

| Rank | Model | Why |
|------|-------|-----|
| 🥇 | **GLM-4.6 (Z.AI)** | Best accuracy (62.5% on COON), fastest responses (2-3s), excellent COON parser |
| 🥈 | **Gemini 2.5 Flash** | Consistent 50% across all formats, good speed (4-7s) |
| 🥉 | **MiniMax-M2** | Thorough reasoning but slowest (9-26s), verbose output |

### Key Observations

1. **GLM-4.6 is the best COON parser** - Same accuracy (62.5%) on COON+Context as Dart baseline!
2. **Context primer helps GLM-4.6** - Improved from 50% (raw) to 62.5% (with context)
3. **All models struggle with counting tasks** - Neither Dart nor COON helps with exact counts
4. **Boolean questions work perfectly** - YES/NO detection unaffected by compression

---

## When to Use COON

### ✅ Recommended Use Cases

| Scenario | Benefit |
|----------|---------|
| **Large codebases (500+ lines)** | Maximum token savings (30%+) |
| **High-volume API queries** | Cumulative cost reduction |
| **Code analysis tasks** | YES/NO questions work perfectly |
| **Structure detection** | Widget presence, navigation, state management |
| **GLM-4.6 integration** | Same accuracy as Dart baseline |
| **Budget-constrained projects** | ~30% cost reduction |

### ⚠️ Use with Caution

| Scenario | Issue |
|----------|-------|
| **Widget counting** | All models struggle with exact counts |
| **Complex nesting** | Deep hierarchies harder to parse |
| **Root widget identification** | COON abbreviations can confuse |

### ❌ Not Recommended

| Scenario | Reason |
|----------|--------|
| **Small files (< 200 lines)** | Overhead not worth savings |
| **Production-critical accuracy** | May need Dart baseline |
| **Security audits** | Need 100% precision |
| **Complex refactoring** | Full context required |

---

## Technical Details

### COON Compression Rules

| Original | COON | Savings |
|----------|------|---------|
| `Container` | `Con` | 6 chars |
| `Text` | `Tx` | 2 chars |
| `padding:` | `p:` | 6 chars |
| `child:` | `c:` | 4 chars |
| `Colors.blue` | `Cb` | 9 chars |
| `EdgeInsets.all(16)` | `E.all(16)` | 9 chars |

### Context Primer (Recommended for GLM-4.6)

Always include this primer when using COON with GLM-4.6:

```
COON is a compressed Dart/Flutter format:
- Widget abbreviations: Container → Con, Text → Tx, Scaffold → S
- Property shortcuts: padding → p, child → c, children → ch
- Value compression: Colors.blue → Cb, EdgeInsets.all → E.all
- Structure: Widget(prop:value) → W(p:v)
```

---

## Advantages & Disadvantages

### ✅ Advantages

1. **~30% token reduction** - Direct cost savings on API calls (28-33% across samples)
2. **1.45x compression ratio** - Meaningful payload reduction
3. **100% accuracy on boolean questions** - YES/NO detection unaffected
4. **Works with all major LLMs** - Tested on Gemini, GLM, MiniMax
5. **GLM-4.6 performs excellently** - Same accuracy as Dart with context primer
6. **2x faster responses with GLM-4.6** - Faster than Dart baseline!

### ❌ Disadvantages

1. **~2% average accuracy drop** - From 54.2% (Dart) to 52.1% (Raw COON)
2. **Counting tasks remain hard** - All models struggle regardless of format
3. **Debugging complexity** - Harder to read compressed output
4. **Multi-value questions challenging** - "BOTH" type answers harder to extract

---

## Conclusion

**COON delivers meaningful cost savings (~30%) with minimal accuracy trade-offs when using the right model (GLM-4.6).**

### Bottom Line

| If You Need... | Use... |
|----------------|--------|
| Maximum accuracy | Dart baseline |
| **Best balance (recommended)** | **COON + Context with GLM-4.6** ⭐ |
| Lowest cost (exploration) | Raw COON |

### Recommended Configuration

```typescript
// Production setup with GLM-4.6
const COON_PRIMER = `COON: Con=Container, Tx=Text, S=Scaffold, p=padding, c=child`;
const prompt = `${COON_PRIMER}\n\n${coonCode}\n\nQuestion: ${question}`;

// Use GLM-4.6 for best COON comprehension (62.5% accuracy)
const response = await glm.chat(prompt, { maxTokens: 1024 });
```

---

## Run Your Own Benchmark

```bash
cd benchmarks
npm install
cp .env.example .env  # Add your API keys
npx tsx --env-file=.env scripts/compression-efficiency-benchmark.ts
```

---

*Report generated from COON SDK benchmark suite on December 5, 2025. Results based on 144 test cases across 2 samples, 3 models, and 3 compression scenarios.*
