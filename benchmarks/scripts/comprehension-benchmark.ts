/**
 * COON Comprehensive Benchmark Script
 * 
 * Tests LLM comprehension of COON-compressed code across multiple models
 * Includes both UI/Widget code AND business logic (repositories, services, etc.)
 * 
 * Usage:
 *   npm run benchmark:comprehension              # Run with top 5 models (default)
 *   npm run benchmark:comprehension -- --all     # Run with all models
 * 
 * Environment Variables:
 *   DRY_RUN=true          - Limit questions for testing
 *   DRY_RUN_LIMIT=5       - Number of questions in dry run
 *   TEST_TYPE=all|ui|logic - Which test suite to run
 *   USE_ALL_MODELS=true   - Use all models instead of top 5
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { 
  createProvider,
  getAvailableProviders,
  generateComprehensionQuestions,
  generateStructuralQuestions,
  generateLogicComprehensionQuestions,
  evaluateComprehension,
  createBenchmarkSummary,
  generateComprehensionReport,
  getRateLimitDelay,
  TOP_5_MODELS,
  ALL_BENCHMARK_MODELS,
  DEFAULT_BENCHMARK_CONFIG,
} from '../src/index.js';

import type { Question, EvaluationResult, CodeFormat } from '../src/types.js';
import type { ProviderModelConfig } from '../src/providers/factory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// Configuration
// ============================================================

// Parse command line args
const args = process.argv.slice(2);
const USE_ALL_MODELS = args.includes('--all') || args.includes('--all-models') || process.env.USE_ALL_MODELS === 'true';
const TEST_TYPE = process.env.TEST_TYPE || 'all'; // 'all', 'ui', 'logic'
const DRY_RUN = process.env.DRY_RUN === 'true';
const DRY_RUN_LIMIT = parseInt(process.env.DRY_RUN_LIMIT || '5', 10);
const FORMATS: CodeFormat[] = ['coon', 'dart'];

// ============================================================
// Helpers
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatProgress(current: number, total: number, model: string): string {
  const pct = ((current / total) * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(current / total * 20)) + '░'.repeat(20 - Math.floor(current / total * 20));
  return `[${bar}] ${pct}% (${current}/${total}) - ${model}`;
}

function printBanner() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║          COON LLM Comprehension Benchmark                         ║');
  console.log('║          Code-Oriented Object Notation                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('');
}

// ============================================================
// Main
// ============================================================

async function main() {
  printBanner();
  
  // Show configuration
  console.log('📋 Configuration:');
  console.log(`   Model Tier: ${USE_ALL_MODELS ? 'ALL MODELS' : 'TOP 5 (default)'}`);
  console.log(`   Test Type: ${TEST_TYPE.toUpperCase()}`);
  console.log(`   Dry Run: ${DRY_RUN ? `Yes (${DRY_RUN_LIMIT} questions)` : 'No'}`);
  console.log(`   Formats: ${FORMATS.join(', ')}`);
  
  // Check available providers
  const availableProviders = getAvailableProviders();
  console.log(`\n🔌 Available Providers: ${availableProviders.length > 0 ? availableProviders.join(', ') : 'None'}`);
  
  // Show API key status
  console.log('\n🔑 API Key Status:');
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log(`   ✓ Gemini: ${process.env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 10)}...`);
  } else {
    console.log('   ✗ Gemini: Not configured');
  }
  if (process.env.GROQ_API_KEY) {
    console.log(`   ✓ Groq: ${process.env.GROQ_API_KEY.substring(0, 10)}...`);
  } else {
    console.log('   ✗ Groq: Not configured');
  }
  if (process.env.OPENROUTER_API_KEY) {
    console.log(`   ✓ OpenRouter: ${process.env.OPENROUTER_API_KEY.substring(0, 15)}...`);
  } else {
    console.log('   ✗ OpenRouter: Not configured');
  }
  
  if (availableProviders.length === 0) {
    console.error('\n❌ No API keys configured. Please set at least one of:');
    console.error('   - GOOGLE_GENERATIVE_AI_API_KEY (for Gemini)');
    console.error('   - GROQ_API_KEY (for Groq/Llama)');
    console.error('   - OPENROUTER_API_KEY (for OpenRouter free models)');
    process.exit(1);
  }
  
  // Select models based on flag
  const selectedModels = USE_ALL_MODELS ? ALL_BENCHMARK_MODELS : TOP_5_MODELS;
  const modelsToTest = selectedModels.filter((m: ProviderModelConfig) => availableProviders.includes(m.provider));
  
  console.log(`\n🤖 Models to Test: ${modelsToTest.length}`);
  modelsToTest.forEach((m: ProviderModelConfig, i: number) => {
    const isTop5 = TOP_5_MODELS.some(t => t.model === m.model);
    console.log(`   ${i + 1}. ${m.model} (${m.provider})${isTop5 ? ' ⭐' : ''}`);
  });
  
  if (modelsToTest.length === 0) {
    console.error('\n❌ No models available with current API keys');
    process.exit(1);
  }
  
  // Generate questions based on test type
  console.log('\n📝 Generating Questions...');
  
  let uiQuestions: Question[] = [];
  let logicQuestions: Question[] = [];
  
  if (TEST_TYPE === 'all' || TEST_TYPE === 'ui') {
    uiQuestions = [
      ...generateComprehensionQuestions(),
      ...generateStructuralQuestions(),
    ];
    console.log(`   UI/Widget Questions: ${uiQuestions.length}`);
  }
  
  if (TEST_TYPE === 'all' || TEST_TYPE === 'logic') {
    logicQuestions = generateLogicComprehensionQuestions();
    console.log(`   Logic/Business Questions: ${logicQuestions.length}`);
  }
  
  let allQuestions = [...uiQuestions, ...logicQuestions];
  
  if (DRY_RUN) {
    console.log(`\n🔬 DRY RUN: Limiting to ${DRY_RUN_LIMIT} questions`);
    // In dry run, sample from both UI and logic
    const uiSample = uiQuestions.slice(0, Math.ceil(DRY_RUN_LIMIT / 2));
    const logicSample = logicQuestions.slice(0, Math.floor(DRY_RUN_LIMIT / 2));
    allQuestions = [...uiSample, ...logicSample];
  }
  
  console.log(`   Total Questions: ${allQuestions.length}`);
  
  // Show question breakdown by type
  const questionsByType: Record<string, number> = {};
  for (const q of allQuestions) {
    questionsByType[q.type] = (questionsByType[q.type] || 0) + 1;
  }
  console.log('\n📊 Questions by Type:');
  for (const [type, count] of Object.entries(questionsByType)) {
    console.log(`   ${type}: ${count}`);
  }
  
  // Run benchmarks
  const allResults: EvaluationResult[] = [];
  const totalEvaluations = allQuestions.length * FORMATS.length * modelsToTest.length;
  let completed = 0;
  
  console.log(`\n🚀 Starting Benchmark (${totalEvaluations} evaluations)...\n`);
  
  for (const modelConfig of modelsToTest) {
    console.log(`\n▶ Testing: ${modelConfig.model}`);
    
    const provider = createProvider(modelConfig);
    if (!provider.isConfigured()) {
      console.log(`  ⚠ Skipping ${modelConfig.model} - not configured`);
      continue;
    }
    
    const rateLimitDelay = getRateLimitDelay(modelConfig.model);
    
    // Per-model progress
    const perModelTotal = allQuestions.length * FORMATS.length;
    let perModelCompleted = 0;
    let perModelCorrect = 0;

    for (const question of allQuestions) {
      for (const format of FORMATS) {
        try {
          const result = await evaluateComprehension(question, format, provider);
          allResults.push(result);
          completed++;
          perModelCompleted++;
          if (result.isCorrect) perModelCorrect++;
          
          // Update progress with accuracy
          const accuracy = perModelCompleted > 0 ? ((perModelCorrect / perModelCompleted) * 100).toFixed(0) : '0';
          process.stdout.write(`\r${formatProgress(perModelCompleted, perModelTotal, modelConfig.model)}  Acc: ${accuracy}%`);
          
          // Rate limiting
          await sleep(rateLimitDelay);
          
        } catch (error) {
          console.error(`\n  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          allResults.push({
            id: question.id,
            format,
            model: modelConfig.model,
            expected: question.groundTruth,
            actual: '',
            isCorrect: false,
            inputTokens: 0,
            outputTokens: 0,
            latencyMs: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          completed++;
          perModelCompleted++;
        }
      }
    }
    console.log(''); // Newline after progress
  }
  
  console.log('\n✅ Benchmark Complete!\n');
  
  // Analyze results
  const successfulResults = allResults.filter(r => !r.error);
  const errorResults = allResults.filter(r => !!r.error);
  
  console.log('═'.repeat(65));
  console.log('  Results Summary');
  console.log('═'.repeat(65));
  console.log(`  Total evaluations: ${allResults.length}`);
  console.log(`  Successful: ${successfulResults.length}`);
  console.log(`  Errors: ${errorResults.length}`);
  
  if (errorResults.length > 0) {
    console.log('\n⚠️  API Errors:');
    const errorsByModel = errorResults.reduce((acc, r) => {
      acc[r.model] = acc[r.model] || [];
      if (r.error) acc[r.model].push(r.error);
      return acc;
    }, {} as Record<string, string[]>);
    
    for (const [model, errors] of Object.entries(errorsByModel)) {
      console.log(`   ${model}: ${errors.length} errors`);
    }
  }
  
  // Analyze UI vs Logic performance
  const uiResults = successfulResults.filter(r => {
    const q = allQuestions.find(q => q.id === r.id);
    return uiQuestions.some(uq => uq.id === q?.id);
  });
  
  const logicResults = successfulResults.filter(r => {
    const q = allQuestions.find(q => q.id === r.id);
    return logicQuestions.some(lq => lq.id === q?.id);
  });
  
  if (uiResults.length > 0 && logicResults.length > 0) {
    console.log('\n📈 Performance by Code Type:');
    const uiCorrect = uiResults.filter(r => r.isCorrect).length;
    const logicCorrect = logicResults.filter(r => r.isCorrect).length;
    console.log(`   UI/Widget:      ${((uiCorrect / uiResults.length) * 100).toFixed(1)}% (${uiCorrect}/${uiResults.length})`);
    console.log(`   Logic/Business: ${((logicCorrect / logicResults.length) * 100).toFixed(1)}% (${logicCorrect}/${logicResults.length})`);
  }
  
  // Generate report
  console.log('\n📊 Generating Report...');
  const summary = createBenchmarkSummary('COON Comprehension', allResults, FORMATS);
  const report = generateComprehensionReport(summary);
  
  // Save results
  const resultsDir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const testSuffix = TEST_TYPE === 'all' ? '' : `-${TEST_TYPE}`;
  const modelSuffix = USE_ALL_MODELS ? '-all-models' : '-top5';
  
  const reportPath = path.join(resultsDir, `comprehension${testSuffix}${modelSuffix}.md`);
  fs.writeFileSync(reportPath, report);
  console.log(`   Report: ${reportPath}`);
  
  // Save raw results as JSON
  const jsonPath = path.join(resultsDir, `comprehension-results${testSuffix}${modelSuffix}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    config: {
      testType: TEST_TYPE,
      useAllModels: USE_ALL_MODELS,
      dryRun: DRY_RUN,
      formats: FORMATS,
      models: modelsToTest.map((m: ProviderModelConfig) => m.model),
      totalQuestions: allQuestions.length,
      uiQuestions: uiQuestions.length,
      logicQuestions: logicQuestions.length,
    },
    summary,
    results: allResults,
    performance: {
      ui: uiResults.length > 0 ? {
        total: uiResults.length,
        correct: uiResults.filter(r => r.isCorrect).length,
        accuracy: uiResults.filter(r => r.isCorrect).length / uiResults.length,
      } : null,
      logic: logicResults.length > 0 ? {
        total: logicResults.length,
        correct: logicResults.filter(r => r.isCorrect).length,
        accuracy: logicResults.filter(r => r.isCorrect).length / logicResults.length,
      } : null,
    },
    errorAnalysis: {
      totalErrors: errorResults.length,
      errorsByModel: errorResults.reduce((acc, r) => {
        acc[r.model] = (acc[r.model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
  }, null, 2));
  console.log(`   JSON: ${jsonPath}`);
  
  // Print final summary table
  console.log('\n' + '═'.repeat(65));
  console.log('  Accuracy by Format');
  console.log('═'.repeat(65));
  
  for (const formatMetrics of summary.byFormat) {
    const accPct = (formatMetrics.accuracy * 100).toFixed(1);
    const effScore = formatMetrics.efficiencyScore.toFixed(2);
    const bar = '█'.repeat(Math.floor(formatMetrics.accuracy * 20)) + '░'.repeat(20 - Math.floor(formatMetrics.accuracy * 20));
    console.log(`  ${formatMetrics.format.padEnd(10)} [${bar}] ${accPct}% | Eff: ${effScore}`);
  }
  
  // Model comparison
  if (summary.byModel.length > 1) {
    console.log('\n' + '═'.repeat(65));
    console.log('  Accuracy by Model');
    console.log('═'.repeat(65));
    
    const sortedModels = [...summary.byModel].sort((a, b) => b.overallAccuracy - a.overallAccuracy);
    for (const model of sortedModels) {
      const accPct = (model.overallAccuracy * 100).toFixed(1);
      const shortName = model.model.split('/').pop()?.replace(':free', '') || model.model;
      console.log(`  ${shortName.padEnd(30)} ${accPct}%`);
    }
  }
  
  console.log('\n✨ Done!\n');
}

main().catch(console.error);
