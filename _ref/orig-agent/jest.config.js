export default {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/core/tests/setup.js'],
  verbose: true,
  transform: {},
  testPathIgnorePatterns: [
    '/node_modules/',
    '/workshop/'
  ]
};