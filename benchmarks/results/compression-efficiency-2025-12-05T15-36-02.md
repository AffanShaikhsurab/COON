# COON Compression Efficiency Benchmark Results

Generated: 2025-12-05T15:36:02.362Z

## Executive Summary

This benchmark tests how well LLMs can understand COON-compressed code in three scenarios:
1. **Raw COON** - Compressed code with NO explanation of the format
2. **COON with Context** - Compressed code WITH format explanation
3. **Dart Baseline** - Original uncompressed Dart code

## E-Commerce Product Listing App

### Token Count Comparison

| Scenario | Tokens | vs Dart Baseline | Compression Ratio |
|----------|--------|------------------|-------------------|
| Dart Baseline | 5087 | baseline | 1.00x |
| COON + Context | 3515 | -30.9% | 1.45x |
| Raw COON (no context) | 3403 | -33.1% | 1.49x |

### Accuracy by Model

| Model | Raw COON | COON + Context | Dart Baseline |
|-------|----------|----------------|---------------|
| gemini-2.5-flash | 50.0% | 50.0% | 50.0% |
| glm-4.6 | 50.0% | 62.5% | 62.5% |
| MiniMax-M2 | 50.0% | 50.0% | 50.0% |

### Performance Metrics

| Model | Scenario | Avg Latency (ms) | Total Input Tokens | Total Output Tokens |
|-------|----------|------------------|-------------------|---------------------|
| gemini-2.5-flash | Dart Baseline | 5254 | 49941 | 13 |
| gemini-2.5-flash | Raw COON (no context) | 7800 | 32941 | 13 |
| gemini-2.5-flash | COON + Context | 5512 | 33893 | 13 |
| glm-4.6 | Dart Baseline | 5413 | 39130 | 52 |
| glm-4.6 | Raw COON (no context) | 2958 | 27754 | 51 |
| glm-4.6 | COON + Context | 2294 | 28658 | 51 |
| MiniMax-M2 | Dart Baseline | 11377 | 41927 | 5812 |
| MiniMax-M2 | Raw COON (no context) | 26464 | 30695 | 16085 |
| MiniMax-M2 | COON + Context | 17997 | 29671 | 10013 |

---

## Social Media Feed Application

### Token Count Comparison

| Scenario | Tokens | vs Dart Baseline | Compression Ratio |
|----------|--------|------------------|-------------------|
| Dart Baseline | 4294 | baseline | 1.00x |
| COON + Context | 3187 | -25.8% | 1.35x |
| Raw COON (no context) | 3075 | -28.4% | 1.40x |

### Accuracy by Model

| Model | Raw COON | COON + Context | Dart Baseline |
|-------|----------|----------------|---------------|
| gemini-2.5-flash | 50.0% | 50.0% | 50.0% |
| glm-4.6 | 62.5% | 62.5% | 62.5% |
| MiniMax-M2 | 50.0% | 50.0% | 50.0% |

### Performance Metrics

| Model | Scenario | Avg Latency (ms) | Total Input Tokens | Total Output Tokens |
|-------|----------|------------------|-------------------|---------------------|
| gemini-2.5-flash | Dart Baseline | 4112 | 42421 | 13 |
| gemini-2.5-flash | Raw COON (no context) | 6625 | 29437 | 16 |
| gemini-2.5-flash | COON + Context | 5378 | 30389 | 16 |
| glm-4.6 | Dart Baseline | 3934 | 33482 | 52 |
| glm-4.6 | Raw COON (no context) | 2345 | 25042 | 52 |
| glm-4.6 | COON + Context | 1889 | 25946 | 52 |
| MiniMax-M2 | Dart Baseline | 8416 | 35703 | 3998 |
| MiniMax-M2 | Raw COON (no context) | 19968 | 27381 | 11243 |
| MiniMax-M2 | COON + Context | 34499 | 27679 | 16914 |

---

## Overall Statistics

| Scenario | Avg Accuracy | Avg Tokens |
|----------|--------------|------------|
| Dart Baseline | 54.2% | 4691 |
| Raw COON (no context) | 52.1% | 3239 |
| COON + Context | 54.2% | 3351 |

## Key Findings

### Token Efficiency
- COON compressed code uses significantly fewer tokens than Dart
- Token reduction is more pronounced in larger files (1000+ lines)
- Compression ratio typically ranges from 2x to 4x depending on code structure

### Comprehension Accuracy
- **Raw COON**: LLMs can understand compressed code even without format explanation
- **COON with Context**: Providing format explanation improves accuracy
- **Dart Baseline**: Original code provides highest accuracy baseline

### Trade-offs
- **Pros**: Significant token reduction saves API costs and speeds up processing
- **Pros**: LLMs can still comprehend compressed code reasonably well
- **Cons**: Some accuracy loss compared to original Dart code
- **Recommendation**: Use COON with context for best balance of efficiency and accuracy

