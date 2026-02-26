import type { Config } from '@jest/types';
import baseConfig from './jest.base.config';

const backendIntegConfig: Config.InitialOptions = {
  ...baseConfig,
  displayName: 'backend-integ',
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '/__tests__/integration/.*\\.(test|spec)\\.tsx?$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/integration/ensure-indexes.spec.ts$',
  ],
  setupFilesAfterEnv: ['<rootDir>/../tests/setupBackend.ts'],
};

export default backendIntegConfig;
