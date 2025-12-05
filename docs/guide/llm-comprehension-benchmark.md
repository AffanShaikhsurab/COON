# LLM Comprehension Benchmark Design for COON

**Version**: 1.0.0  
**Status**: Proposal  
**Last Updated**: December 2024

## Executive Summary

This document outlines a comprehensive benchmarking strategy to evaluate whether Large Language Models (LLMs) can **understand and work with** COON-compressed Dart/Flutter code. While token efficiency is important, compression is meaningless if LLMs cannot interpret the compressed format.

Inspired by [TOON's Retrieval Accuracy Benchmark](https://github.com/toon-format/toon), this proposal adapts their methodology for code compression rather than data serialization.

---

## 1. Introduction

### 1.1 The Problem

COON achieves 60-70% token reduction, but we need to answer:

1. **Can LLMs understand COON-compressed code?**
2. **Can LLMs generate correct COON output?**
3. **Can LLMs modify/extend COON-compressed code?**
4. **How does comprehension compare to raw Dart code?**

### 1.2 Benchmark Goals

| Goal | Description |
|------|-------------|
| **Comprehension Accuracy** | Measure LLM's ability to answer questions about compressed code |
| **Code Generation Quality** | Evaluate LLM's ability to generate valid COON output |
| **Task Completion Rate** | Test ability to complete coding tasks using compressed format |
| **Efficiency Analysis** | Compare accuracy per token across formats |

### 1.3 Key Differences from TOON Benchmarks

| Aspect | TOON (Data) | COON (Code) |
|--------|-------------|-------------|
| Content | JSON-like structured data | Dart/Flutter source code |
| Questions | Field retrieval, aggregation | Code understanding, modification |
| Validation | Deterministic value comparison | AST comparison, semantic equivalence |
| Formats | TOON, JSON, XML, YAML, CSV | COON, Raw Dart, Minified Dart |

---

## 2. Benchmark Architecture

### 2.1 Component Overview

```
benchmarks/
├── README.md                    # Benchmark documentation
├── package.json                 # Dependencies
├── .env.example                 # API keys template
├── data/
│   ├── code-samples/           # Dart/Flutter code samples
│   │   ├── widgets.dart
│   │   ├── screens.dart
│   │   ├── state-management.dart
│   │   └── complex-apps.dart
│   └── questions/              # Generated question sets
├── results/
│   ├── comprehension.md        # Comprehension benchmark results
│   ├── generation.md           # Generation benchmark results
│   └── efficiency.md           # Efficiency analysis
├── scripts/
│   ├── comprehension-benchmark.ts
│   ├── generation-benchmark.ts
│   └── token-efficiency-benchmark.ts
└── src/
    ├── constants.ts
    ├── datasets.ts             # Code sample generators
    ├── evaluate.ts             # LLM evaluation logic
    ├── formatters.ts           # COON/Dart formatters
    ├── normalize.ts            # Answer normalization
    ├── report.ts               # Report generation
    ├── storage.ts              # Result caching
    ├── types.ts
    ├── utils.ts
    └── questions/
        ├── comprehension.ts    # Code understanding questions
        ├── modification.ts     # Code modification tasks
        ├── generation.ts       # Code generation tasks
        └── structural.ts       # Structure awareness questions
```

### 2.2 Technology Stack

```json
{
  "dependencies": {
    "@ai-sdk/anthropic": "^2.0.x",
    "@ai-sdk/google": "^2.0.x",
    "@ai-sdk/openai": "^2.0.x",
    "ai": "^5.0.x",
    "gpt-tokenizer": "^3.4.x",
    "p-queue": "^9.0.x",
    "@faker-js/faker": "^10.x",
    "unstorage": "^1.17.x"
  }
}
```

---

## 3. Benchmark Categories

### 3.1 Code Comprehension Benchmark

Tests whether LLMs can **understand** COON-compressed code.

#### 3.1.1 Question Types

| Type | Description | Example |
|------|-------------|---------|
| **Widget Identification** | Identify widgets in compressed code | "What widgets are in this screen?" |
| **Property Retrieval** | Extract specific property values | "What is the padding value?" |
| **Structure Understanding** | Understand code hierarchy | "How many children does the Column have?" |
| **Semantic Analysis** | Understand code behavior | "What happens when the button is pressed?" |
| **Relationship Mapping** | Identify widget relationships | "What is the parent of the Text widget?" |

#### 3.1.2 Sample Questions

```typescript
// Widget Identification
{
  id: "q001",
  type: "widget-identification",
  prompt: "List all Flutter widgets used in this code (comma-separated).",
  coonCode: "c:MyScreen<StatelessWidget>;m:b S{b:C{h:[T\"Hello\",E{c:T\"Click\",p:()=>print(\"Hi\")}]}}",
  groundTruth: "Scaffold,Column,Text,ElevatedButton",
  answerType: "csv-list-unordered"
}

// Property Retrieval
{
  id: "q002", 
  type: "property-retrieval",
  prompt: "What is the text content of the first Text widget?",
  coonCode: "c:MyWidget<StatelessWidget>;m:b S{b:P{p:@16,c:T\"Welcome Back\"}}",
  groundTruth: "Welcome Back",
  answerType: "string"
}

// Structure Understanding
{
  id: "q003",
  type: "structure-understanding",
  prompt: "How many direct children does the Column widget have?",
  coonCode: "c:MyScreen<StatelessWidget>;m:b S{b:C{h:[T\"One\",T\"Two\",T\"Three\",Z{h:10}]}}",
  groundTruth: "4",
  answerType: "integer"
}
```

#### 3.1.3 Evaluation Methodology

```typescript
async function evaluateComprehension(
  question: Question,
  format: "coon" | "dart" | "minified"
): Promise<EvaluationResult> {
  const code = formatCode(question.originalCode, format);
  
  const prompt = `
${PRIMERS[format]}

Given the following ${format === "coon" ? "COON-compressed" : "Dart"} code:

\`\`\`${format === "coon" ? "coon" : "dart"}
${code}
\`\`\`

Question: ${question.prompt}

Answer format: ${question.answerFormat}

Answer:`;

  const { text, usage } = await generateText({ model, prompt });
  
  return {
    questionId: question.id,
    format,
    expected: question.groundTruth,
    actual: text.trim(),
    isCorrect: compareAnswers(text.trim(), question.groundTruth, question.answerType),
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens
  };
}
```

### 3.2 Code Generation Benchmark

Tests whether LLMs can **generate valid COON output**.

#### 3.2.1 Task Types

| Type | Description | Validation |
|------|-------------|------------|
| **Dart to COON** | Convert Dart code to COON | Decompress and compare AST |
| **COON Modification** | Modify existing COON code | Validate syntax + semantics |
| **COON Completion** | Complete partial COON code | Syntax + functional test |
| **Natural Language to COON** | Generate COON from description | Decompress and validate |

#### 3.2.2 Sample Tasks

```typescript
// Dart to COON Conversion
{
  id: "gen001",
  type: "dart-to-coon",
  prompt: "Convert this Dart code to COON format:",
  dartCode: `
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Hello')),
      body: Center(child: Text('World')),
    );
  }
}`,
  expectedCoon: "c:MyWidget<StatelessWidget>;m:b S{a:B{t:T'Hello'},b:N{c:T'World'}}",
  validationMethod: "semantic-equivalence"
}

// COON Modification
{
  id: "gen002",
  type: "coon-modification",
  prompt: "Add a floating action button with a '+' icon to this COON code:",
  inputCoon: "c:MyScreen<StatelessWidget>;m:b S{b:N{c:T'Content'}}",
  expectedOutput: "c:MyScreen<StatelessWidget>;m:b S{b:N{c:T'Content'},f:FloatingActionButton{c:Ic{i:Icons.add}}}",
  validationMethod: "contains-widget"
}

// Natural Language to COON
{
  id: "gen003",
  type: "nl-to-coon",
  prompt: "Generate COON code for a login screen with email and password fields, and a submit button.",
  requirements: ["TextField for email", "TextField for password", "ElevatedButton"],
  validationMethod: "requirements-check"
}
```

#### 3.2.3 Validation Methods

```typescript
// Semantic Equivalence Validation
function validateSemanticEquivalence(
  generatedCoon: string,
  expectedCoon: string
): ValidationResult {
  const generated = decompressCoon(generatedCoon);
  const expected = decompressCoon(expectedCoon);
  
  // Parse both to AST
  const genAST = parseDart(generated);
  const expAST = parseDart(expected);
  
  return {
    valid: compareAST(genAST, expAST),
    syntaxValid: isValidCoon(generatedCoon),
    decompressable: generated !== null,
    semanticallyEquivalent: compareAST(genAST, expAST)
  };
}

// Requirements Check Validation
function validateRequirements(
  generatedCoon: string,
  requirements: string[]
): ValidationResult {
  const dartCode = decompressCoon(generatedCoon);
  
  return {
    valid: requirements.every(req => checkRequirement(dartCode, req)),
    syntaxValid: isValidCoon(generatedCoon),
    requirementsMet: requirements.map(req => ({
      requirement: req,
      met: checkRequirement(dartCode, req)
    }))
  };
}
```

### 3.3 Code Modification Benchmark

Tests whether LLMs can **modify** COON-compressed code correctly.

#### 3.3.1 Modification Types

| Type | Description | Example Task |
|------|-------------|--------------|
| **Add Widget** | Add a new widget | "Add a loading indicator" |
| **Change Property** | Modify existing property | "Change padding from 16 to 24" |
| **Remove Widget** | Remove a widget | "Remove the AppBar" |
| **Refactor** | Restructure code | "Extract the form into a separate widget" |
| **Fix Bug** | Correct an issue | "Fix the null safety issue" |

#### 3.3.2 Sample Tasks

```typescript
{
  id: "mod001",
  type: "add-widget",
  prompt: "Add a CircularProgressIndicator centered in the body when isLoading is true.",
  inputCoon: "c:MyScreen<StatefulWidget>;m:b S{b:C{h:[T'Content']}}",
  expectedBehavior: "Shows loading indicator when isLoading is true",
  validationMethod: "behavior-check"
}
```

### 3.4 Structure Awareness Benchmark

Tests whether LLMs understand COON's structural conventions.

#### 3.4.1 Question Types

```typescript
// Abbreviation Recognition
{
  id: "struct001",
  prompt: "What does 'S' represent in COON format?",
  groundTruth: "Scaffold",
  answerType: "string"
}

// Format Understanding
{
  id: "struct002", 
  prompt: "What does 'c:' prefix indicate in COON?",
  groundTruth: "class declaration",
  answerType: "string"
}

// Syntax Validation
{
  id: "struct003",
  prompt: "Is this valid COON syntax? Answer YES or NO: c:MyWidget<;m:b T'Hi'",
  groundTruth: "NO",
  answerType: "boolean"
}
```

---

## 4. Dataset Design

### 4.1 Code Sample Categories

| Category | Size | Description | Complexity |
|----------|------|-------------|------------|
| Simple Widgets | 20 | Single widget examples | Low |
| Composed Screens | 30 | Multi-widget screens | Medium |
| Stateful Widgets | 20 | State management examples | Medium |
| Complex Apps | 15 | Multi-screen applications | High |
| Edge Cases | 15 | Unusual patterns | Variable |
| **Total** | **100** | | |

### 4.2 Sample Generation

```typescript
// Simple Widget Generator
function generateSimpleWidgets(): CodeSample[] {
  return [
    {
      name: "text-widget",
      dart: `Text("Hello World")`,
      coon: `T"Hello World"`,
      complexity: "simple",
      widgets: ["Text"]
    },
    {
      name: "container-with-child",
      dart: `Container(
        padding: EdgeInsets.all(16),
        child: Text("Content")
      )`,
      coon: `K{p:@16,c:T"Content"}`,
      complexity: "simple",
      widgets: ["Container", "Text"]
    }
    // ... more samples
  ];
}

// Screen Generator
function generateScreenSamples(): CodeSample[] {
  const screens = [
    generateLoginScreen(),
    generateHomeScreen(),
    generateSettingsScreen(),
    generateProfileScreen(),
    generateListScreen()
  ];
  
  return screens.map(screen => ({
    name: screen.name,
    dart: screen.dartCode,
    coon: compressDart(screen.dartCode),
    complexity: screen.complexity,
    widgets: extractWidgets(screen.dartCode)
  }));
}
```

### 4.3 Question Generation

```typescript
// Dynamic Question Generator
function generateQuestions(samples: CodeSample[]): Question[] {
  const questions: Question[] = [];
  
  for (const sample of samples) {
    // Widget identification questions
    questions.push({
      id: `widget-${sample.name}`,
      type: "widget-identification",
      prompt: "List all Flutter widgets used in this code.",
      coonCode: sample.coon,
      dartCode: sample.dart,
      groundTruth: sample.widgets.join(","),
      answerType: "csv-list-unordered"
    });
    
    // Structure questions
    if (sample.complexity !== "simple") {
      questions.push({
        id: `structure-${sample.name}`,
        type: "structure-understanding",
        prompt: "What is the root widget of this code?",
        coonCode: sample.coon,
        dartCode: sample.dart,
        groundTruth: identifyRootWidget(sample.dart),
        answerType: "string"
      });
    }
    
    // Property questions for each widget
    const properties = extractProperties(sample.dart);
    for (const prop of properties.slice(0, 3)) {
      questions.push({
        id: `prop-${sample.name}-${prop.name}`,
        type: "property-retrieval",
        prompt: `What is the value of ${prop.name}?`,
        coonCode: sample.coon,
        dartCode: sample.dart,
        groundTruth: prop.value,
        answerType: prop.type
      });
    }
  }
  
  return questions;
}
```

---

## 5. Evaluation Methodology

### 5.1 Format Primers

```typescript
export const PRIMERS: Record<string, string> = {
  "coon": `COON (Code-Oriented Object Notation) is a compressed format for Dart/Flutter code.
Key abbreviations:
- c: = class, m: = method, f: = final field
- S = Scaffold, C = Column, R = Row, T = Text, K = Container
- N = Center, P = Padding, B = AppBar, E = ElevatedButton
- {} = widget body, [] = children array, @ = EdgeInsets
- < = extends, > = implements`,

  "dart": "Standard Dart/Flutter code with full widget names and formatting.",
  
  "minified": "Dart code with whitespace removed but full names preserved."
};
```

### 5.2 Answer Normalization

```typescript
// Type-aware answer comparison
function compareAnswers(
  actual: string,
  expected: string,
  type: AnswerType
): boolean {
  switch (type) {
    case "integer":
      return normalizeInteger(actual) === normalizeInteger(expected);
      
    case "string":
      return normalizeString(actual) === normalizeString(expected);
      
    case "csv-list-ordered":
      return arraysEqual(parseCSV(actual), parseCSV(expected));
      
    case "csv-list-unordered":
      return setsEqual(parseCSV(actual), parseCSV(expected));
      
    case "boolean":
      return normalizeBoolean(actual) === normalizeBoolean(expected);
      
    case "widget-name":
      return normalizeWidgetName(actual) === normalizeWidgetName(expected);
      
    default:
      return actual.toLowerCase().trim() === expected.toLowerCase().trim();
  }
}

// Widget name normalization (handles COON abbreviations)
function normalizeWidgetName(name: string): string {
  const abbreviations: Record<string, string> = {
    "S": "Scaffold", "C": "Column", "R": "Row",
    "T": "Text", "K": "Container", "N": "Center",
    "P": "Padding", "B": "AppBar", "E": "ElevatedButton"
  };
  
  return abbreviations[name] || name;
}
```

### 5.3 Metrics Collection

```typescript
interface BenchmarkMetrics {
  // Accuracy Metrics
  overallAccuracy: number;           // Percentage of correct answers
  accuracyByFormat: Record<string, number>;
  accuracyByQuestionType: Record<string, number>;
  accuracyByComplexity: Record<string, number>;
  
  // Token Efficiency
  tokensPerFormat: Record<string, number>;
  accuracyPerToken: Record<string, number>;  // Accuracy / Tokens * 1000
  
  // Generation Metrics (for generation benchmark)
  syntaxValidity: number;            // Percentage of syntactically valid COON
  semanticEquivalence: number;       // Percentage semantically correct
  decompressionSuccess: number;      // Percentage that decompresses
  
  // Latency
  avgLatencyMs: number;
  latencyByModel: Record<string, number>;
}
```

---

## 6. Implementation Plan

### 6.1 Phase 1: Infrastructure (Week 1)

| Task | Description | Status |
|------|-------------|--------|
| Project setup | Create benchmarks directory structure | ⬜ |
| Dependencies | Install AI SDK, tokenizer, utilities | ⬜ |
| Configuration | Set up model configs, rate limits | ⬜ |
| Storage | Implement result caching | ⬜ |

### 6.2 Phase 2: Data Generation (Week 2)

| Task | Description | Status |
|------|-------------|--------|
| Code samples | Create 100 Dart/Flutter samples | ⬜ |
| COON conversion | Compress all samples to COON | ⬜ |
| Question generation | Generate comprehension questions | ⬜ |
| Ground truth | Validate all ground truth answers | ⬜ |

### 6.3 Phase 3: Evaluation Pipeline (Week 3)

| Task | Description | Status |
|------|-------------|--------|
| Comprehension eval | Implement comprehension benchmark | ⬜ |
| Generation eval | Implement generation benchmark | ⬜ |
| Modification eval | Implement modification benchmark | ⬜ |
| Report generation | Create markdown report generator | ⬜ |

### 6.4 Phase 4: Execution & Analysis (Week 4)

| Task | Description | Status |
|------|-------------|--------|
| Run benchmarks | Execute across all models | ⬜ |
| Analyze results | Process and interpret data | ⬜ |
| Documentation | Write findings report | ⬜ |
| Optimization | Identify improvement areas | ⬜ |

---

## 7. Expected Outputs

### 7.1 Comprehension Report

```markdown
#### LLM Comprehension Accuracy

Benchmarks test LLM comprehension of COON-compressed code using 300 questions across 100 code samples.

##### Efficiency Ranking (Accuracy per 1K Tokens)

```
COON           ████████████████████   28.5 acc%/1K tok  │  78.2% acc  │  2,744 tokens
Minified Dart  █████████████████░░░   22.1 acc%/1K tok  │  76.5% acc  │  3,461 tokens
Raw Dart       ██████████████░░░░░░   15.8 acc%/1K tok  │  79.1% acc  │  5,008 tokens
```

##### Per-Model Accuracy

```
claude-sonnet-4
→ COON           ████████████████░░░░    81.3% (244/300)
  Minified Dart  ████████████████░░░░    79.7% (239/300)
  Raw Dart       ████████████████░░░░    82.0% (246/300)

gpt-4o
→ COON           █████████████████░░░    85.0% (255/300)
  Minified Dart  █████████████████░░░    83.3% (250/300)
  Raw Dart       █████████████████░░░    86.7% (260/300)
```
```

### 7.2 Generation Report

```markdown
#### COON Generation Quality

##### Syntax Validity by Model

| Model | Valid Syntax | Decompressable | Semantic Match |
|-------|--------------|----------------|----------------|
| claude-sonnet-4 | 92.5% | 89.0% | 85.3% |
| gpt-4o | 94.2% | 91.5% | 88.7% |
| gemini-2.0-flash | 88.3% | 84.2% | 79.5% |

##### Task Completion Rate

| Task Type | COON | Raw Dart |
|-----------|------|----------|
| Dart → COON | 87.5% | N/A |
| Modification | 82.3% | 89.1% |
| NL → Code | 78.9% | 85.2% |
```

---

## 8. Success Criteria

### 8.1 Minimum Viable Benchmarks

| Metric | Target | Rationale |
|--------|--------|-----------|
| COON Comprehension | ≥75% | Must be usable by LLMs |
| COON Generation Validity | ≥85% | Must produce valid output |
| Efficiency Gain | ≥1.5x | Must justify token reduction |
| Comprehension Gap | ≤5% vs Raw | Shouldn't lose too much accuracy |

### 8.2 Success Indicators

✅ **Success**: COON achieves ≥75% comprehension with ≥1.5x efficiency  
⚠️ **Partial**: Comprehension ≥65% but efficiency gain <1.5x  
❌ **Failure**: Comprehension <65% regardless of efficiency

---

## 9. Future Enhancements

### 9.1 Extended Benchmarks

- **Multi-turn conversations**: Test code modification across conversation turns
- **Agent workflows**: Benchmark multi-agent code transfer scenarios
- **Real-world tasks**: Use actual GitHub PRs and issues

### 9.2 Additional Metrics

- **Consistency**: Same question, multiple runs
- **Prompt sensitivity**: How prompt variations affect accuracy
- **Fine-tuning potential**: Can models be fine-tuned on COON?

---

## 10. Appendix

### 10.1 COON Primer (Full)

```
COON (Code-Oriented Object Notation) Primer:

STRUCTURE:
- c:Name<Parent> = class Name extends Parent
- m:methodName = method declaration
- f:fieldName = final field

WIDGETS (Single Letter):
- S = Scaffold, C = Column, R = Row, T = Text
- K = Container, N = Center, P = Padding, B = AppBar
- E = ElevatedButton, F = TextField, L = ListView
- Z = SizedBox, Ic = Icon, Cd = Card

PROPERTIES:
- a: = appBar, b: = body, c: = child, h: = children
- t: = title, p: = padding, f: = floatingActionButton
- @ = EdgeInsets (e.g., @16 = EdgeInsets.all(16))

SYNTAX:
- {} = widget body with properties
- [] = array/list of children
- ; = statement separator
- , = property/item separator
```

### 10.2 References

- [TOON Benchmarks](https://github.com/toon-format/toon/tree/main/benchmarks)
- [COON Specification](../reference/spec.md)
- [Compression Strategies](./compression-strategies.md)
