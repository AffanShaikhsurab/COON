# COON Scripts

This directory contains utility scripts for the COON project.

## Scripts

### `generate-browser-abbreviations.js`

**Purpose**: Generate `packages/javascript/src/browser.ts` from canonical spec/data sources.

**Why**: Ensures abbreviations stay synchronized with the canonical sources in `spec/languages/` while maintaining browser compatibility. This follows the project convention: "NEVER hardcode abbreviations - Always load from spec/data/".

**Usage**:
```bash
# Run directly
node scripts/generate-browser-abbreviations.js

# Or via npm script (recommended)
cd packages/javascript
npm run generate:browser
```

**When to use**:
- After editing abbreviation files in `spec/languages/dart/` or `spec/languages/javascript/`
- The build process automatically runs this via `npm run prebuild`
- Before committing changes to abbreviation data

**How it works**:
1. Reads abbreviation JSON files from:
   - `spec/languages/dart/widgets.json`
   - `spec/languages/dart/keywords.json`
   - `spec/languages/dart/properties.json`
   - `spec/languages/javascript/components.json` (flattened structure)
   - `spec/languages/javascript/keywords.json`
   - `spec/languages/javascript/properties.json`

2. Generates a TypeScript file with:
   - Warning header indicating it's auto-generated
   - Embedded abbreviation data as TypeScript Records
   - Browser-compatible compression functions (no Node.js dependencies)
   - Sample code for testing/demo

3. Output is written to `packages/javascript/src/browser.ts`

**Note**: The generated `browser.ts` file should be committed to the repository since it's required for browser builds and is deterministic (always produces the same output from the same spec files).

### `run_conformance.py`

Cross-SDK conformance testing for Python and JavaScript implementations.

**Usage**:
```bash
python scripts/run_conformance.py
```

See Python documentation for more details.
