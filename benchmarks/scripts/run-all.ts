/**
 * Run All COON Benchmarks
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runScript(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['tsx', scriptPath], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    proc.on('error', reject);
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  COON Complete Benchmark Suite');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  const startTime = Date.now();
  
  try {
    // Run comprehension benchmark
    console.log('\n[1/2] Running Comprehension Benchmark...\n');
    await runScript(path.join(__dirname, 'comprehension-benchmark.ts'));
    
    // Run generation benchmark
    console.log('\n[2/2] Running Generation Benchmark...\n');
    await runScript(path.join(__dirname, 'generation-benchmark.ts'));
    
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  All Benchmarks Complete!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Total Duration: ${duration} minutes`);
    console.log('  Results saved to: benchmarks/results/');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  }
}

main();
