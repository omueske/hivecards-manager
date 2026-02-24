import type { Config } from '@jest/types';
import baseConfig from './jest.base.config';

const frontendConfig: Config.InitialOptions = {
  ...baseConfig,
  displayName: 'frontend',
  rootDir: 'frontend',
  testEnvironment: 'jsdom',
  testRegex: '/tests/.*\\.(test|spec)\\.tsx?$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
};

export default frontendConfig;
