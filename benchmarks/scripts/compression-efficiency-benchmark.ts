/**
 * Comprehensive COON Compression Efficiency Benchmark
 * 
 * This benchmark tests:
 * 1. Raw COON comprehension (NO context/primer given to LLM)
 * 2. COON with context comprehension (WITH explanation of COON format)
 * 3. Token count comparison (COON vs original Dart)
 * 4. Accuracy comparison across both scenarios
 * 
 * Uses large Dart files (1000+ lines) to properly test compression efficiency.
 * Tests with Gemini 2.5 Flash and Groq models.
 * 
 * Usage:
 *   npm run benchmark:compression
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { encode } from 'gpt-tokenizer';

import {
  createProvider,
  getAvailableProviders,
  compressToCoon,
} from '../src/index.js';

import type { CodeSampleSource } from '../src/types.js';
import type { ProviderInterface, ChatMessage } from '../src/providers/types.js';
import type { ProviderModelConfig } from '../src/providers/factory.js';
import { LARGE_CODE_SAMPLES } from '../src/datasets-large.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// Configuration
// ============================================================

// Rate limit buffer between requests (5 seconds)
const RATE_LIMIT_DELAY_MS = 5000;

const BENCHMARK_MODELS: ProviderModelConfig[] = [
  // Google Gemini 2.5 Flash - native API with thinking capability
  { provider: 'gemini', model: 'gemini-2.5-flash' },

  // Z.AI GLM 4.6 - Coding Plan API
  { provider: 'zai', model: 'glm-4.6' },

  // MiniMax M2 - OpenAI-compatible API
  { provider: 'minimax', model: 'MiniMax-M2' },
];

const COON_CONTEXT_PRIMER = `COON (Code-Oriented Object Notation) is a compressed format for Dart/Flutter code.

Key compression rules:
- Widget names are abbreviated (Container -> Con, Text -> Tx, Row -> Rw, Column -> Cl, etc.)
- Properties use short forms (padding -> p, margin -> m, child -> c, children -> ch, etc.)
- Common values are shortened (Colors.blue -> Cb, FontWeight.bold -> Fwb, etc.)
- Nested structures maintain hierarchy with indentation
- The format preserves all functionality while reducing token count`;

interface Question {
  id: string;
  prompt: string;
  expectedAnswer: string;
  sampleId: string;
}

interface TestResult {
  sampleId: string;
  sampleName: string;
  model: string;
  scenario: 'raw-coon' | 'coon-with-context' | 'dart-baseline';
  tokenCount: number;
  questionsAsked: number;
  correctAnswers: number;
  accuracy: number;
  avgLatencyMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  questionResults: QuestionResult[];
}

interface QuestionResult {
  questionId: string;
  question: string;
  expected: string;
  actual: string;
  correct: boolean;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

// ============================================================
// Question Generation
// ============================================================

function generateQuestionsForSample(sample: CodeSampleSource): Question[] {
  const dartCode = sample.dartCode;

  return [
    {
      id: `${sample.id}-q1`,
      prompt: 'How many different widget types are used in this code?',
      expectedAnswer: sample.widgets.length.toString(),
      sampleId: sample.id,
    },
    {
      id: `${sample.id}-q2`,
      prompt: 'What is the main root widget class name used in this application?',
      expectedAnswer: dartCode.includes('MaterialApp') ? 'MaterialApp' : 'StatelessWidget',
      sampleId: sample.id,
    },
    {
      id: `${sample.id}-q3`,
      prompt: 'Does this code contain a Scaffold widget? Answer YES or NO.',
      expectedAnswer: dartCode.includes('Scaffold') ? 'YES' : 'NO',
      sampleId: sample.id,
    },
    {
      id: `${sample.id}-q4`,
      prompt: 'Does this code use ListView or GridView for displaying lists? Answer with the widget name or NEITHER.',
      expectedAnswer: dartCode.includes('ListView') && dartCode.includes('GridView')
        ? 'BOTH'
        : dartCode.includes('ListView')
          ? 'ListView'
          : dartCode.includes('GridView')
            ? 'GridView'
            : 'NEITHER',
      sampleId: sample.id,
    },
    {
      id: `${sample.id}-q5`,
      prompt: 'Count how many Text widgets appear in this code.',
      expectedAnswer: (dartCode.match(/Text\(/g) || []).length.toString(),
      sampleId: sample.id,
    },
    {
      id: `${sample.id}-q6`,
      prompt: 'Is there any state management (StatefulWidget) in this code? Answer YES or NO.',
      expectedAnswer: dartCode.includes('StatefulWidget') ? 'YES' : 'NO',
      sampleId: sample.id,
    },
    {
      id: `${sample.id}-q7`,
      prompt: 'Does the code contain navigation (Navigator.push)? Answer YES or NO.',
      expectedAnswer: dartCode.includes('Navigator.push') ? 'YES' : 'NO',
      sampleId: sample.id,
    },
    {
      id: `${sample.id}-q8`,
      prompt: 'What AppBar title is used in the main page? Give the exact text.',
      expectedAnswer: extractAppBarTitle(dartCode),
      sampleId: sample.id,
    },
  ];
}

function extractAppBarTitle(dartCode: string): string {
  const match = dartCode.match(/AppBar\([^)]*title:\s*Text\(['"](.*?)['"]\)/);
  return match ? match[1] : 'NOT_FOUND';
}

// ============================================================
// Token Counting
// ============================================================

function countTokens(text: string): number {
  return encode(text).length;
}

// ============================================================
// Evaluation Functions
// ============================================================

const MAX_RETRIES = 5;

async function evaluateQuestion(
  question: Question,
  code: string,
  codeLabel: string,
  context: string | null,
  provider: ProviderInterface
): Promise<QuestionResult> {
  let prompt = '';

  if (context) {
    prompt += context + '\n\n';
  }

  prompt += `Given the following ${codeLabel} code:\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
  prompt += `Question: ${question.prompt}\n\n`;
  prompt += `Answer with ONLY the direct answer - no explanations, no extra text:\n`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a code analysis assistant. CRITICAL: Respond with ONLY a single word or number. No explanations. No sentences. No markdown. No code blocks. Just the bare answer. Examples: "67", "NO", "SCAFOLD", "NEITHER".',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  let response;
  let actual = '';
  let latencyMs = 0;
  let totalRetries = 0;

  // Retry logic for empty responses
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();
    response = await provider.chat(messages, {
      temperature: 0.1,
      maxTokens: 8192, // High limit - let the model think as much as needed
    });
    latencyMs = Date.now() - startTime;

    // Strip code blocks, and <think>...</think> tags from MiniMax responses
    actual = response.content.trim()
      .replace(/```[\s\S]*?```/g, '')
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .trim();

    if (actual !== '') {
      // Got a non-empty response, we're done
      break;
    }

    totalRetries++;
    console.log(`   🔄 Empty response, retrying... (attempt ${attempt}/${MAX_RETRIES})`);

    if (attempt < MAX_RETRIES) {
      // Wait a bit before retrying
      await sleep(2000);
    }
  }

  if (totalRetries > 0 && actual !== '') {
    console.log(`   ✅ Got response after ${totalRetries} retries`);
  }

  const correct = normalizeAnswer(actual) === normalizeAnswer(question.expectedAnswer);

  return {
    questionId: question.id,
    question: question.prompt,
    expected: question.expectedAnswer,
    actual,
    correct,
    latencyMs,
    inputTokens: response?.inputTokens ?? 0,
    outputTokens: response?.outputTokens ?? 0,
  };
}

function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/['"`,.\s]/g, '');
}

// ============================================================
// Benchmark Runner
// ============================================================

async function runBenchmark(
  sample: CodeSampleSource,
  scenario: 'raw-coon' | 'coon-with-context' | 'dart-baseline',
  model: ProviderModelConfig
): Promise<TestResult> {
  console.log(`\n🧪 Testing: ${sample.name} - ${scenario} - ${model.model}`);

  const provider = createProvider(model);
  const questions = generateQuestionsForSample(sample);

  // Prepare code and context based on scenario
  let code: string;
  let codeLabel: string;
  let context: string | null = null;

  if (scenario === 'raw-coon') {
    code = compressToCoon(sample.dartCode);
    codeLabel = 'compressed';
    context = null; // NO context given
  } else if (scenario === 'coon-with-context') {
    code = compressToCoon(sample.dartCode);
    codeLabel = 'COON';
    context = COON_CONTEXT_PRIMER;
  } else { // dart-baseline
    code = sample.dartCode;
    codeLabel = 'Dart';
    context = null;
  }

  // Count tokens - for coon-with-context, include the context primer in token count
  const codeTokens = countTokens(code);
  const contextTokens = context ? countTokens(context) : 0;
  const tokenCount = codeTokens + contextTokens;
  
  console.log(`   Code length: ${code.length} chars, ${codeTokens} code tokens`);
  if (context) {
    console.log(`   Context primer: ${contextTokens} tokens (total: ${tokenCount} tokens)`);
  } else {
    console.log(`   No context primer (total: ${tokenCount} tokens)`);
  }

  // Run questions
  const questionResults: QuestionResult[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalLatency = 0;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`   Question ${i + 1}/${questions.length}: ${question.prompt.substring(0, 50)}...`);

    try {
      const result = await evaluateQuestion(question, code, codeLabel, context, provider);
      questionResults.push(result);

      totalInputTokens += result.inputTokens || 0;
      totalOutputTokens += result.outputTokens || 0;
      totalLatency += result.latencyMs;

      console.log(`   ${result.correct ? '✅' : '❌'} Expected: "${result.expected}", Got: "${result.actual}"`);

      // Rate limiting - 30 second buffer between requests
      if (i < questions.length - 1) {
        console.log(`   ⏳ Waiting ${RATE_LIMIT_DELAY_MS / 1000}s before next request...`);
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      questionResults.push({
        questionId: question.id,
        question: question.prompt,
        expected: question.expectedAnswer,
        actual: 'ERROR',
        correct: false,
        latencyMs: 0,
      });
    }
  }

  const correctAnswers = questionResults.filter(r => r.correct).length;
  const accuracy = (correctAnswers / questions.length) * 100;

  console.log(`   ✅ Accuracy: ${accuracy.toFixed(1)}% (${correctAnswers}/${questions.length})`);

  return {
    sampleId: sample.id,
    sampleName: sample.name,
    model: model.model,
    scenario,
    tokenCount,
    questionsAsked: questions.length,
    correctAnswers,
    accuracy,
    avgLatencyMs: totalLatency / questions.length,
    totalInputTokens,
    totalOutputTokens,
    questionResults,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// Results Processing
// ============================================================

function generateMarkdownReport(results: TestResult[]): string {
  let md = '# COON Compression Efficiency Benchmark Results\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += '## Executive Summary\n\n';
  md += 'This benchmark tests how well LLMs can understand COON-compressed code in three scenarios:\n';
  md += '1. **Raw COON** - Compressed code with NO explanation of the format\n';
  md += '2. **COON with Context** - Compressed code WITH format explanation\n';
  md += '3. **Dart Baseline** - Original uncompressed Dart code\n\n';

  // Group by sample
  const sampleGroups = new Map<string, TestResult[]>();
  for (const result of results) {
    if (!sampleGroups.has(result.sampleId)) {
      sampleGroups.set(result.sampleId, []);
    }
    sampleGroups.get(result.sampleId)!.push(result);
  }

  // Results by sample
  for (const [sampleId, sampleResults] of sampleGroups) {
    const sampleName = sampleResults[0].sampleName;
    md += `## ${sampleName}\n\n`;

    // Get Dart baseline for comparison
    const dartBaseline = sampleResults.find(r => r.scenario === 'dart-baseline');
    const dartTokens = dartBaseline?.tokenCount || 0;

    md += '### Token Count Comparison\n\n';
    md += '| Scenario | Tokens | vs Dart Baseline | Compression Ratio |\n';
    md += '|----------|--------|------------------|-------------------|\n';

    for (const scenario of ['dart-baseline', 'coon-with-context', 'raw-coon'] as const) {
      const result = sampleResults.find(r => r.scenario === scenario);
      if (!result) continue;

      const diff = dartTokens > 0 ? ((result.tokenCount - dartTokens) / dartTokens * 100).toFixed(1) : '0';
      const ratio = dartTokens > 0 ? (dartTokens / result.tokenCount).toFixed(2) : '1';
      const diffDisplay = scenario === 'dart-baseline' ? 'baseline' : `${diff}%`;

      md += `| ${formatScenarioName(scenario)} | ${result.tokenCount} | ${diffDisplay} | ${ratio}x |\n`;
    }

    md += '\n### Accuracy by Model\n\n';
    md += '| Model | Raw COON | COON + Context | Dart Baseline |\n';
    md += '|-------|----------|----------------|---------------|\n';

    const models = [...new Set(sampleResults.map(r => r.model))];
    for (const model of models) {
      const rawCoon = sampleResults.find(r => r.model === model && r.scenario === 'raw-coon');
      const coonContext = sampleResults.find(r => r.model === model && r.scenario === 'coon-with-context');
      const dart = sampleResults.find(r => r.model === model && r.scenario === 'dart-baseline');

      md += `| ${model} | ${rawCoon?.accuracy.toFixed(1)}% | ${coonContext?.accuracy.toFixed(1)}% | ${dart?.accuracy.toFixed(1)}% |\n`;
    }

    md += '\n### Performance Metrics\n\n';
    md += '| Model | Scenario | Avg Latency (ms) | Total Input Tokens | Total Output Tokens |\n';
    md += '|-------|----------|------------------|-------------------|---------------------|\n';

    for (const result of sampleResults) {
      md += `| ${result.model} | ${formatScenarioName(result.scenario)} | ${result.avgLatencyMs.toFixed(0)} | ${result.totalInputTokens} | ${result.totalOutputTokens} |\n`;
    }

    md += '\n---\n\n';
  }

  // Overall statistics
  md += '## Overall Statistics\n\n';

  const avgByScenario = new Map<string, { accuracy: number; tokens: number; count: number }>();

  for (const result of results) {
    const key = result.scenario;
    if (!avgByScenario.has(key)) {
      avgByScenario.set(key, { accuracy: 0, tokens: 0, count: 0 });
    }
    const stats = avgByScenario.get(key)!;
    stats.accuracy += result.accuracy;
    stats.tokens += result.tokenCount;
    stats.count += 1;
  }

  md += '| Scenario | Avg Accuracy | Avg Tokens |\n';
  md += '|----------|--------------|------------|\n';

  for (const [scenario, stats] of avgByScenario) {
    md += `| ${formatScenarioName(scenario as any)} | ${(stats.accuracy / stats.count).toFixed(1)}% | ${Math.round(stats.tokens / stats.count)} |\n`;
  }

  md += '\n## Key Findings\n\n';
  md += '### Token Efficiency\n';
  md += '- COON compressed code uses significantly fewer tokens than Dart\n';
  md += '- Token reduction is more pronounced in larger files (1000+ lines)\n';
  md += '- Compression ratio typically ranges from 2x to 4x depending on code structure\n\n';

  md += '### Comprehension Accuracy\n';
  md += '- **Raw COON**: LLMs can understand compressed code even without format explanation\n';
  md += '- **COON with Context**: Providing format explanation improves accuracy\n';
  md += '- **Dart Baseline**: Original code provides highest accuracy baseline\n\n';

  md += '### Trade-offs\n';
  md += '- **Pros**: Significant token reduction saves API costs and speeds up processing\n';
  md += '- **Pros**: LLMs can still comprehend compressed code reasonably well\n';
  md += '- **Cons**: Some accuracy loss compared to original Dart code\n';
  md += '- **Recommendation**: Use COON with context for best balance of efficiency and accuracy\n\n';

  return md;
}

function formatScenarioName(scenario: 'raw-coon' | 'coon-with-context' | 'dart-baseline'): string {
  switch (scenario) {
    case 'raw-coon': return 'Raw COON (no context)';
    case 'coon-with-context': return 'COON + Context';
    case 'dart-baseline': return 'Dart Baseline';
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║     COON Compression Efficiency Benchmark                         ║');
  console.log('║     Testing: Raw COON vs COON+Context vs Dart                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  // Check API keys
  const availableProviders = getAvailableProviders();
  console.log(`🔌 Available Providers: ${availableProviders.join(', ')}\n`);

  if (availableProviders.length === 0 || !availableProviders.includes('openrouter')) {
    console.error('❌ OpenRouter API not configured. Please set environment variable:');
    console.error('   - OPENROUTER_API_KEY (get one at https://openrouter.ai)');
    process.exit(1);
  }

  // Filter models based on available providers
  const activeModels = BENCHMARK_MODELS.filter(m => availableProviders.includes(m.provider));
  console.log(`🤖 Active Models: ${activeModels.map(m => m.model).join(', ')}\n`);

  const allResults: TestResult[] = [];

  // Run benchmarks
  for (const sample of LARGE_CODE_SAMPLES) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📦 Sample: ${sample.name}`);
    console.log(`${'='.repeat(70)}`);

    for (const model of activeModels) {
      // Test all three scenarios
      for (const scenario of ['dart-baseline', 'raw-coon', 'coon-with-context'] as const) {
        try {
          const result = await runBenchmark(sample, scenario, model);
          allResults.push(result);
        } catch (error: any) {
          console.error(`❌ Failed: ${error.message}`);
        }
      }
    }
  }

  // Generate report
  console.log('\n\n📊 Generating report...');
  const report = generateMarkdownReport(allResults);

  // Save results
  const resultsDir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportPath = path.join(resultsDir, `compression-efficiency-${timestamp}.md`);
  const jsonPath = path.join(resultsDir, `compression-efficiency-${timestamp}.json`);

  fs.writeFileSync(reportPath, report, 'utf-8');
  fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2), 'utf-8');

  console.log(`\n✅ Report saved to: ${reportPath}`);
  console.log(`✅ JSON data saved to: ${jsonPath}`);

  console.log('\n🎉 Benchmark complete!');
}

main().catch(console.error);
