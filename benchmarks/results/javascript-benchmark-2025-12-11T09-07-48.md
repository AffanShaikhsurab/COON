# COON JavaScript/React Benchmark Results

**Generated**: 2025-12-11T09:07:48.625Z

## Overview

This benchmark tests LLM comprehension of COON-compressed JavaScript/React code:

| Scenario | Description |
|----------|-------------|
| **Raw COON** | Compressed code with NO explanation |
| **COON + Context** | Compressed code WITH format primer |
| **JS Baseline** | Original JavaScript code |

## Results by Scenario

| Scenario | Avg Accuracy | Avg Tokens |
|----------|--------------|------------|
| JS Baseline | 100.0% | 66 |
| Raw COON | 86.7% | 57 |
| COON + Context | 100.0% | 177 |

## Results by Model

| Model | Raw COON | COON + Context | JS Baseline |
|-------|----------|----------------|-------------|
| moonshotai/kimi-k2-instruct | 100.0% | 100.0% | 100.0% |

## Detailed Results by Sample

### Simple Function

**JS Baseline** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 13

**Raw COON** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 10

**COON + Context** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 130

### Simple React Component

**JS Baseline** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 28

**Raw COON** (moonshotai/kimi-k2-instruct)
- Accuracy: 83.3% (5/6)
- Tokens: 31

**COON + Context** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 151

### Counter with useState

**JS Baseline** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 79

**Raw COON** (moonshotai/kimi-k2-instruct)
- Accuracy: 83.3% (5/6)
- Tokens: 65

**COON + Context** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 185

### Effect Hook

**JS Baseline** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 89

**Raw COON** (moonshotai/kimi-k2-instruct)
- Accuracy: 83.3% (5/6)
- Tokens: 74

**COON + Context** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 194

### User List

**JS Baseline** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 122

**Raw COON** (moonshotai/kimi-k2-instruct)
- Accuracy: 83.3% (5/6)
- Tokens: 107

**COON + Context** (moonshotai/kimi-k2-instruct)
- Accuracy: 100.0% (6/6)
- Tokens: 227

