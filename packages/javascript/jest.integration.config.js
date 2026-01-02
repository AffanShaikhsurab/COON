/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests/integration'],
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    testTimeout: 120000, // 2 minutes timeout for npm install operations
    verbose: true,
    // Don't run in parallel to avoid npm conflicts
    maxWorkers: 1,
};
