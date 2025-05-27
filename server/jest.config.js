module.exports = {
  testEnvironment: 'node',
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!**/__tests__/**', // Exclude test files themselves from coverage report
    // Exclude other files not relevant for coverage if any
  ],
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  // The root directory that Jest should scan for tests and modules within
  // rootDir: '.', // Default, not usually needed
  // Test setup file path after environment setup
  // setupFilesAfterEnv: ['./__tests__/setup.js'], // If you create a setup file
  // Verbose output from tests
  verbose: true,
};
