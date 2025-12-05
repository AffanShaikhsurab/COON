# 🔬 COON Compression Benchmark Report

> **Generated:** December 5, 2025  
> **Test Date:** 2025-12-05T12:50:43Z  
> **Test Suite:** Compression Efficiency Benchmark

---

## 📊 Executive Summary

This comprehensive benchmark evaluates the performance of LLMs (Large Language Models) when comprehending Flutter/Dart code in three different formats:

| Format | Description |
|--------|-------------|
| **Dart Baseline** | Original uncompressed Dart code |
| **Raw COON** | COON-compressed code with NO explanatory context |
| **COON with Context** | COON-compressed code WITH format explanation primer |

### 🏆 Key Findings at a Glance

| Metric | Dart Baseline | Raw COON | COON + Context |
|--------|---------------|----------|----------------|
| **Average Accuracy** | 58.3% | 52.1% | 52.1% |
| **Average Tokens** | 4,691 | 3,239 | 3,239 |
| **Token Reduction** | — | -30.9% | -30.9% |
| **Compression Ratio** | 1.00x | ~1.45x | ~1.45x |

---

## 🤖 Model Performance Comparison

### Overall Model Rankings

| Rank | Model | Dart Accuracy | COON (Raw) | COON + Context | Best For |
|------|-------|---------------|------------|----------------|----------|
| 🥇 1 | **GLM-4.6 (Z.AI)** | 62.5% | 56.25% | 56.25% | Best overall balance |
| 🥈 2 | **Gemini 2.5 Flash** | 62.5% | 50.0% | 50.0% | Dart comprehension |
| 🥉 3 | **MiniMax-M2** | 50.0% | 50.0% | 50.0% | Consistent across formats |

### Detailed Accuracy by Sample

#### E-Commerce Product Listing App

| Model | Dart Baseline | Raw COON | COON + Context |
|-------|---------------|----------|----------------|
| Gemini 2.5 Flash | 50.0% (4/8) | 50.0% (4/8) | 50.0% (4/8) |
| GLM-4.6 | **62.5% (5/8)** | 50.0% (4/8) | 50.0% (4/8) |
| MiniMax-M2 | 50.0% (4/8) | 50.0% (4/8) | 50.0% (4/8) |

#### Social Media Feed Application

| Model | Dart Baseline | Raw COON | COON + Context |
|-------|---------------|----------|----------------|
| Gemini 2.5 Flash | **75.0% (6/8)** | 50.0% (4/8) | 50.0% (4/8) |
| GLM-4.6 | 62.5% (5/8) | **62.5% (5/8)** | **62.5% (5/8)** |
| MiniMax-M2 | 50.0% (4/8) | 50.0% (4/8) | 50.0% (4/8) |

---

## 📉 Token Efficiency Analysis

### Compression Results

| Sample | Dart Tokens | COON Tokens | Reduction | Compression Ratio |
|--------|-------------|-------------|-----------|-------------------|
| E-Commerce App | 5,087 | 3,403 | **-33.1%** | **1.49x** |
| Social Media App | 4,294 | 3,075 | **-28.4%** | **1.40x** |

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

## ⚡ Latency & Performance Metrics

### Average Response Latency (ms)

| Model | Dart Baseline | Raw COON | COON + Context |
|-------|---------------|----------|----------------|
| Gemini 2.5 Flash | 4,343 | 6,778 | 7,416 |
| **GLM-4.6** | **4,867** | **1,950** | **2,807** |
| MiniMax-M2 | 8,246 | 15,404 | 29,062 |

**Best Performer:** GLM-4.6 with ~2x faster response times on COON

### Token Generation Efficiency

| Model | Output Tokens (Dart) | Output Tokens (COON) |
|-------|---------------------|---------------------|
| Gemini 2.5 Flash | 13 | 13-14 |
| GLM-4.6 | 52 | 51-52 |
| MiniMax-M2 | 2,321 | 7,085-9,870 |

**Note:** MiniMax-M2 generates significantly more output tokens (verbose reasoning), leading to higher latency.

---

## 🎯 Question-by-Question Analysis

### Questions Where All Models Succeeded ✅

| Question Type | Example | Success Rate |
|---------------|---------|--------------|
| Boolean Detection | "Does code contain Scaffold?" | **100%** |
| Boolean Detection | "Is there StatefulWidget?" | **100%** |
| Boolean Detection | "Does code contain navigation?" | **100%** |
| String Extraction | "What is the AppBar title?" | **100%** |

### Questions Where Models Struggled ❌

| Question Type | Example | Success Rate | Issue |
|---------------|---------|--------------|-------|
| Widget Counting | "How many widget types?" | **0%** | Over-counting in all formats |
| Root Widget ID | "Main root widget class?" | **0%** | Returned class name, not widget |
| Multi-Answer | "ListView or GridView?" | **33%** | Failed to answer "BOTH" |
| Text Widget Count | "Count Text widgets" | **0%** | Inconsistent counting |

---

## 📈 Key Insights

### 1. **COON Compression is Effective**
- Achieves **28-33% token reduction** while maintaining comparable accuracy
- Models can understand COON format even WITHOUT explicit context primer
- Context primer showed minimal improvement (same accuracy as raw COON)

### 2. **Model Strengths**

| Model | Strength | Best Use Case |
|-------|----------|---------------|
| **GLM-4.6** | Fastest, most consistent with COON | Production COON parsing |
| **Gemini 2.5 Flash** | Highest Dart baseline accuracy | Complex Dart analysis |
| **MiniMax-M2** | Thorough reasoning | Deep code understanding (when time permits) |

### 3. **Question Type Impact**

| Question Type | Dart Accuracy | COON Accuracy | Recommendation |
|---------------|---------------|---------------|----------------|
| Boolean Y/N | High | High | ✅ Safe for COON |
| String Extraction | High | High | ✅ Safe for COON |
| Counting | Low | Low | ⚠️ Improve in both |
| Multi-value | Medium | Low | ⚠️ Use structured prompts |

---

## 🎯 Recommendations

### For COON Format Usage:

1. **Use COON for Token Optimization** - ~30% reduction with minimal accuracy loss
2. **GLM-4.6 is the Best COON Parser** - Best balance of speed and accuracy
3. **Skip Context Primer** - No significant accuracy improvement observed
4. **Best for Boolean/Detection Questions** - 100% success rate
5. **Avoid Complex Counting Tasks** - All models struggle with widget enumeration

### For Future Benchmarks:

1. Add more **business logic** samples (services, repositories, state management)
2. Test with **larger code samples** (2000+ lines)
3. Include **cross-reference questions** ("Which widget calls X method?")
4. Add **code modification tasks** ("Add a loading state")

---

## 📋 Test Configuration

```
Models Tested: 3
├── Gemini 2.5 Flash (Google)
├── GLM-4.6 (Z.AI)
└── MiniMax-M2

Samples Tested: 2
├── E-Commerce Product Listing App (1000+ lines)
└── Social Media Feed Application (800+ lines)

Scenarios: 3
├── Dart Baseline (original code)
├── Raw COON (compressed, no context)
└── COON + Context (compressed + format primer)

Questions per Sample: 8
Total Evaluations: 144 (2 samples × 3 models × 3 scenarios × 8 questions)
```

---

## 📌 Conclusion

**COON compression delivers meaningful token savings (~30%) while maintaining reasonable comprehension accuracy.** The format is best suited for:

- ✅ Token cost optimization in high-volume scenarios
- ✅ Boolean/detection questions with clear answers
- ✅ String extraction and simple property lookups
- ⚠️ Complex counting tasks require additional prompt engineering

**Best Model for COON:** **GLM-4.6** - Fast, accurate, and cost-effective.

---

*Report generated by COON Benchmark Suite v1.0*
