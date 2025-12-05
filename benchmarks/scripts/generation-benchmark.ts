/**
 * COON Generation Benchmark Script
 * 
 * Tests LLM ability to generate valid COON code
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { 
  createProvider,
  getAvailableProviders,
  generateGenerationTasks,
  evaluateGeneration,
  generateGenerationReport,
  getRateLimitDelay,
  BENCHMARK_MODELS,
} from '../src/index.js';

import type { GenerationResult } from '../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// Configuration
// ============================================================

const DRY_RUN = process.env.DRY_RUN === 'true';
const DRY_RUN_LIMIT = parseInt(process.env.DRY_RUN_LIMIT || '5', 10);

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

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  COON Generation Benchmark');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  // Check available providers
  const availableProviders = getAvailableProviders();
  console.log(`Available providers: ${availableProviders.length > 0 ? availableProviders.join(', ') : 'None'}`);
  
  if (availableProviders.length === 0) {
    console.error('\n❌ No API keys configured. Please set at least one of:');
    console.error('   - GOOGLE_GENERATIVE_AI_API_KEY (for Gemini)');
    console.error('   - GROQ_API_KEY (for Groq/Kimi)');
    console.error('   - OPENROUTER_API_KEY (for OpenRouter free models)');
    process.exit(1);
  }
  
  // Filter models to only available providers
  const modelsToTest = BENCHMARK_MODELS.filter(m => availableProviders.includes(m.provider));
  console.log(`\nModels to test: ${modelsToTest.length}`);
  modelsToTest.forEach(m => console.log(`  - ${m.model} (${m.provider})`));
  
  // Get generation tasks
  console.log('\n📝 Loading generation tasks...');
  let tasks = generateGenerationTasks();
  
  if (DRY_RUN) {
    console.log(`\n🔬 DRY RUN mode: limiting to ${DRY_RUN_LIMIT} tasks`);
    tasks = tasks.slice(0, DRY_RUN_LIMIT);
  }
  
  console.log(`   Total tasks: ${tasks.length}`);
  
  // Run benchmarks
  const allResults: GenerationResult[] = [];
  const totalEvaluations = tasks.length * modelsToTest.length;
  let completed = 0;
  
  console.log(`\n🚀 Starting benchmark (${totalEvaluations} total evaluations)...\n`);
  
  for (const modelConfig of modelsToTest) {
    console.log(`\n▶ Testing: ${modelConfig.model}`);
    
    const provider = createProvider(modelConfig);
    if (!provider.isConfigured()) {
      console.log(`  ⚠ Skipping ${modelConfig.model} - not configured`);
      continue;
    }
    
    const rateLimitDelay = getRateLimitDelay(modelConfig.model);
    
    // Per-model progress
    const perModelTotal = tasks.length;
    let perModelCompleted = 0;

    for (const task of tasks) {
      try {
        const result = await evaluateGeneration(task, provider);
        allResults.push(result);
        completed++;
        perModelCompleted++;
        
        // Update progress (show per-model and overall progress)
        process.stdout.write(`\r${formatProgress(perModelCompleted, perModelTotal, modelConfig.model)}  (Overall ${completed}/${totalEvaluations})`);
        
        // Rate limiting
        await sleep(rateLimitDelay);
        
      } catch (error) {
        console.error(`\n  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        allResults.push({
          taskId: task.id,
          model: modelConfig.model,
          generatedCode: '',
          syntaxValid: false,
          decompressable: false,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: 0,
        });
        completed++;
      }
    }
  }
  
  console.log('\n\n✅ Benchmark complete!\n');
  
  // Generate report
  console.log('📊 Generating report...');
  const report = generateGenerationReport(allResults);
  
  // Save results
  const resultsDir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const reportPath = path.join(resultsDir, 'generation.md');
  fs.writeFileSync(reportPath, report);
  console.log(`   Report saved to: ${reportPath}`);
  
  // Save raw results as JSON
  const jsonPath = path.join(resultsDir, 'generation-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    config: {
      dryRun: DRY_RUN,
      models: modelsToTest.map(m => m.model),
      totalTasks: tasks.length,
    },
    results: allResults,
  }, null, 2));
  console.log(`   Raw results saved to: ${jsonPath}`);
  
  // Print summary
  console.log('\n' + '═'.repeat(65));
  console.log('  Summary');
  console.log('═'.repeat(65));
  
  // Calculate aggregate metrics
  const syntaxValidCount = allResults.filter(r => r.syntaxValid).length;
  const semanticCount = allResults.filter(r => r.semanticallyCorrect).length;
  
  console.log(`  Syntax Validity:  ${((syntaxValidCount / allResults.length) * 100).toFixed(1)}%`);
  console.log(`  Semantic Match:   ${((semanticCount / allResults.length) * 100).toFixed(1)}%`);
  
  // Per model
  const models = [...new Set(allResults.map(r => r.model))];
  console.log('\n  Per Model:');
  for (const model of models) {
    const modelResults = allResults.filter(r => r.model === model);
    const sv = ((modelResults.filter(r => r.syntaxValid).length / modelResults.length) * 100).toFixed(1);
    console.log(`    ${model}: ${sv}% syntax valid`);
  }
  
  console.log('');
}

main().catch(console.error);
