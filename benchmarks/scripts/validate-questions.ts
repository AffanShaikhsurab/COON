/**
 * Validate Questions Script
 * 
 * Validates all generated questions for correctness
 */

import { 
  generateComprehensionQuestions,
  generateStructuralQuestions,
  generateGenerationTasks,
  getSampleStats,
  getQuestionStats,
  getTaskStats,
  isValidCoonSyntax,
  ALL_CODE_SAMPLES,
} from '../src/index.js';

function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  COON Question Validation');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  // Sample statistics
  console.log('📊 Code Samples:');
  const sampleStats = getSampleStats();
  console.log(`   Total: ${sampleStats.total}`);
  console.log(`   By Complexity:`);
  Object.entries(sampleStats.byComplexity).forEach(([k, v]) => {
    console.log(`     - ${k}: ${v}`);
  });
  console.log(`   By Category:`);
  Object.entries(sampleStats.byCategory).forEach(([k, v]) => {
    console.log(`     - ${k}: ${v}`);
  });
  console.log(`   Unique Widgets: ${sampleStats.uniqueWidgets}`);
  console.log('');
  
  // Comprehension questions
  console.log('📝 Comprehension Questions:');
  const comprehensionQuestions = generateComprehensionQuestions(ALL_CODE_SAMPLES);
  const questionStats = getQuestionStats(ALL_CODE_SAMPLES);
  console.log(`   Total: ${questionStats.total}`);
  console.log(`   By Type:`);
  Object.entries(questionStats.byType).forEach(([k, v]) => {
    console.log(`     - ${k}: ${v}`);
  });
  console.log('');
  
  // Structural questions
  console.log('🏗️  Structural Questions:');
  const structuralQuestions = generateStructuralQuestions();
  console.log(`   Total: ${structuralQuestions.length}`);
  console.log('');
  
  // Generation tasks
  console.log('🔧 Generation Tasks:');
  const generationTasks = generateGenerationTasks();
  const taskStats = getTaskStats();
  console.log(`   Total: ${taskStats.total}`);
  console.log(`   By Type:`);
  Object.entries(taskStats.byType).forEach(([k, v]) => {
    console.log(`     - ${k}: ${v}`);
  });
  console.log('');
  
  // Validate COON syntax in questions
  console.log('✅ Validating COON Syntax in Questions...');
  const allQuestions = [...comprehensionQuestions, ...structuralQuestions];
  let invalidCount = 0;
  const invalidQuestions: string[] = [];
  
  for (const q of allQuestions) {
    if (q.coonCode && !isValidCoonSyntax(q.coonCode)) {
      invalidCount++;
      invalidQuestions.push(`   ❌ ${q.id}: ${q.coonCode.substring(0, 50)}...`);
    }
  }
  
  if (invalidCount === 0) {
    console.log(`   ✅ All ${allQuestions.length} questions have valid COON syntax`);
  } else {
    console.log(`   ⚠️  ${invalidCount}/${allQuestions.length} questions have potentially invalid COON:`);
    invalidQuestions.slice(0, 10).forEach(q => console.log(q));
    if (invalidQuestions.length > 10) {
      console.log(`   ... and ${invalidQuestions.length - 10} more`);
    }
  }
  console.log('');
  
  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Code Samples:            ${sampleStats.total}`);
  console.log(`  Comprehension Questions: ${comprehensionQuestions.length}`);
  console.log(`  Structural Questions:    ${structuralQuestions.length}`);
  console.log(`  Generation Tasks:        ${generationTasks.length}`);
  console.log(`  Total Test Items:        ${comprehensionQuestions.length + structuralQuestions.length + generationTasks.length}`);
  console.log('');
}

main();
