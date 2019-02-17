const { resolve } = require('path');

const JEST = resolve(__dirname);
const ROOT = resolve(JEST, '../');
const conf = {
  automock: false,
  bail: false,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
  ],
  coverageDirectory: `.coverage`,
  coverageReporters: [
    'html',
    'json',
    'lcov',
    'text-summary',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: [ 'js' ],
  moduleNameMapper: {},
  rootDir: ROOT,
  roots: ['src'],
  setupFiles: [
    `${ JEST }/shims.js`,
    `${ JEST }/bootstrap.js`,
  ],
  testEnvironment: 'node',
  testURL: 'http://localhost',
  timers: 'fake',
};

module.exports = conf;
