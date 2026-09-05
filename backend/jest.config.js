module.exports = {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setupFilesAfterEnv.js'],
  testTimeout: 30000,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/docs/**'],
  coverageDirectory: '<rootDir>/coverage',
};
