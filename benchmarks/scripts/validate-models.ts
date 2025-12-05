/**
 * Model Validation Script
 * 
 * Tests which LLM models are actually available before running benchmarks
 */

import { 
  createProvider,
  getAvailableProviders,
  BENCHMARK_MODELS,
} from '../src/index.js';

import type { ProviderModelConfig } from '../src/providers/factory.js';

const TEST_PROMPT = 'What is 2 + 2? Answer with just the number.';

async function validateModel(config: ProviderModelConfig): Promise<{
  model: string;
  provider: string;
  available: boolean;
  latencyMs: number;
  error?: string;
}> {
  const provider = createProvider(config);
  
  if (!provider.isConfigured()) {
    return {
      model: config.model,
      provider: config.provider,
      available: false,
      latencyMs: 0,
      error: `${config.provider} not configured (missing API key)`,
    };
  }

  const startTime = Date.now();
  
  try {
    const response = await provider.chat([
      { role: 'user', content: TEST_PROMPT },
    ], {
      temperature: 0,
      maxTokens: 10,
    });

    const latencyMs = Date.now() - startTime;

    if (response.error) {
      return {
        model: config.model,
        provider: config.provider,
        available: false,
        latencyMs,
        error: response.error,
      };
    }

    return {
      model: config.model,
      provider: config.provider,
      available: true,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      model: config.model,
      provider: config.provider,
      available: false,
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  COON Benchmark - Model Validation');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  // Check available providers
  const availableProviders = getAvailableProviders();
  console.log(`Available providers: ${availableProviders.length > 0 ? availableProviders.join(', ') : 'None'}`);
  console.log('');
  
  // Filter models to only available providers
  const modelsToTest = BENCHMARK_MODELS.filter(m => availableProviders.includes(m.provider));
  
  if (modelsToTest.length === 0) {
    console.error('❌ No models to test. Configure at least one API key.');
    process.exit(1);
  }

  console.log(`Testing ${modelsToTest.length} models...\n`);

  const results = await Promise.all(modelsToTest.map(validateModel));

  // Display results
  console.log('Results:\n');
  
  const available = results.filter(r => r.available);
  const unavailable = results.filter(r => !r.available);

  if (available.length > 0) {
    console.log('✅ Available models:');
    for (const r of available) {
      console.log(`   ${r.model} (${r.provider}) - ${r.latencyMs}ms`);
    }
    console.log('');
  }

  if (unavailable.length > 0) {
    console.log('❌ Unavailable models:');
    for (const r of unavailable) {
      console.log(`   ${r.model} (${r.provider})`);
      console.log(`      Error: ${r.error}`);
    }
    console.log('');
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Summary: ${available.length}/${results.length} models available`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (available.length === 0) {
    console.log('\n⚠️  No models available for benchmarking.');
    console.log('   Please check your API keys and model IDs.');
    process.exit(1);
  }

  // Output valid models for use in benchmark
  console.log('\n📋 Working models (copy to BENCHMARK_MODELS if needed):');
  console.log(JSON.stringify(
    available.map(r => ({ provider: r.provider, model: r.model })),
    null,
    2
  ));
}

main().catch(console.error);
