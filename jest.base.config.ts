import type { Config } from '@jest/types';

// common options used by all projects
const baseConfig: Config.InitialOptions = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,
  // coverage is enabled via CLI flags; thresholds are configured per project
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};

export default baseConfig;
