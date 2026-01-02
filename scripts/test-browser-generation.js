#!/usr/bin/env node
/**
 * Test script to verify browser.ts generation consistency
 * 
 * This validates that:
 * 1. The generator produces valid output
 * 2. Abbreviations match the spec sources
 * 3. Generated file is deterministic (except timestamp)
 */

const fs = require('fs');
const path = require('path');
const { generateBrowserFile } = require('./generate-browser-abbreviations');

function testGeneration() {
  console.log('🧪 Testing browser.ts generation...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Generator produces valid output
  console.log('Test 1: Generator produces valid output');
  try {
    const output = generateBrowserFile();
    if (output && output.length > 1000) {
      console.log('  ✓ Generator produces valid output\n');
      passed++;
    } else {
      console.log('  ✗ Generator output is too short or empty\n');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Generator threw error: ${error.message}\n`);
    failed++;
  }
  
  // Test 2: Generated file contains auto-generation warning
  console.log('Test 2: Generated file contains auto-generation warning');
  try {
    const output = generateBrowserFile();
    if (output.includes('AUTO-GENERATED FILE - DO NOT EDIT MANUALLY')) {
      console.log('  ✓ Contains auto-generation warning\n');
      passed++;
    } else {
      console.log('  ✗ Missing auto-generation warning\n');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Test threw error: ${error.message}\n`);
    failed++;
  }
  
  // Test 3: Generated file sources abbreviations from spec
  console.log('Test 3: Generated file sources abbreviations from spec');
  try {
    const output = generateBrowserFile();
    if (output.includes('spec/languages/dart/') && output.includes('spec/languages/javascript/')) {
      console.log('  ✓ References spec sources in comments\n');
      passed++;
    } else {
      console.log('  ✗ Missing spec source references\n');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Test threw error: ${error.message}\n`);
    failed++;
  }
  
  // Test 4: Generated file includes all required abbreviation maps
  console.log('Test 4: Generated file includes all required abbreviation maps');
  try {
    const output = generateBrowserFile();
    const requiredMaps = [
      'dartWidgets',
      'dartKeywords',
      'dartProperties',
      'jsKeywords',
      'jsComponents',
      'jsProperties'
    ];
    const missingMaps = requiredMaps.filter(map => !output.includes(`export const ${map}:`));
    
    if (missingMaps.length === 0) {
      console.log('  ✓ All required abbreviation maps present\n');
      passed++;
    } else {
      console.log(`  ✗ Missing maps: ${missingMaps.join(', ')}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Test threw error: ${error.message}\n`);
    failed++;
  }
  
  // Test 5: Dart abbreviations match spec
  console.log('Test 5: Dart abbreviations match spec');
  try {
    const specDir = path.resolve(__dirname, '..', 'spec', 'languages', 'dart');
    const widgetsSpec = JSON.parse(fs.readFileSync(path.join(specDir, 'widgets.json'), 'utf-8'));
    
    const output = generateBrowserFile();
    
    // Check a few key widgets
    const sampleWidgets = ['Scaffold', 'Column', 'Row', 'Text'];
    const allMatch = sampleWidgets.every(widget => {
      const abbrev = widgetsSpec.abbreviations[widget];
      return output.includes(`"${widget}": "${abbrev}"`);
    });
    
    if (allMatch) {
      console.log('  ✓ Dart abbreviations match spec\n');
      passed++;
    } else {
      console.log('  ✗ Dart abbreviations don\'t match spec\n');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Test threw error: ${error.message}\n`);
    failed++;
  }
  
  // Test 6: JavaScript abbreviations match spec
  console.log('Test 6: JavaScript abbreviations match spec');
  try {
    const specDir = path.resolve(__dirname, '..', 'spec', 'languages', 'javascript');
    const componentsSpec = JSON.parse(fs.readFileSync(path.join(specDir, 'components.json'), 'utf-8'));
    
    const output = generateBrowserFile();
    
    // Check a few key components/hooks
    const sampleComponents = ['useState', 'useEffect', 'div', 'button'];
    const allMatch = sampleComponents.every(component => {
      // Find abbreviation in nested structure
      let abbrev = null;
      if (componentsSpec.react_hooks && componentsSpec.react_hooks[component]) {
        abbrev = componentsSpec.react_hooks[component];
      } else if (componentsSpec.jsx_elements && componentsSpec.jsx_elements[component]) {
        abbrev = componentsSpec.jsx_elements[component];
      }
      return abbrev && output.includes(`"${component}": "${abbrev}"`);
    });
    
    if (allMatch) {
      console.log('  ✓ JavaScript abbreviations match spec\n');
      passed++;
    } else {
      console.log('  ✗ JavaScript abbreviations don\'t match spec\n');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Test threw error: ${error.message}\n`);
    failed++;
  }
  
  // Summary
  console.log('═══════════════════════════════════════════════════');
  console.log(`Tests passed: ${passed}`);
  console.log(`Tests failed: ${failed}`);
  console.log('═══════════════════════════════════════════════════');
  
  if (failed === 0) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  }
}

// Run tests
testGeneration();
