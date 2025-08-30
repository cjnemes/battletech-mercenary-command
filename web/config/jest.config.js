module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Root directory
  rootDir: '../',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/src/**/*.test.js'
  ],
  
  // Module name mapping (matching webpack aliases)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@systems/(.*)$': '<rootDir>/src/systems/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    
    // Handle CSS imports in tests
    '\\.(css|scss)$': 'identity-obj-proxy',
    
    // Handle asset imports
    '\\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/index.js',
    '!src/data/**/*', // Exclude data files from coverage
    '!src/assets/**/*' // Exclude assets
  ],
  
  coverageDirectory: '<rootDir>/tests/coverage',
  
  coverageReporters: [
    'text',
    'html',
    'lcov'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    },
    // Higher standards for critical game systems
    './src/systems/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Mock configurations
  clearMocks: true,
  restoreMocks: true,
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Module directories
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  
  // Test timeout (useful for integration tests)
  testTimeout: 10000,
  
  // Verbose output during testing
  verbose: true,
  
  // Global test setup
  globals: {
    __DEV__: true,
    __PROD__: false,
    __VERSION__: '0.2.0'
  },
  
  // Error handling
  errorOnDeprecated: true,
  
  // Test result processor (for integration with tools)
  testResultsProcessor: 'jest-sonar-reporter'
};