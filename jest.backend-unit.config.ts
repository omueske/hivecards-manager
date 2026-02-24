import type { Config } from '@jest/types';
import baseConfig from './jest.base.config';

const backendUnitConfig: Config.InitialOptions = {
  ...baseConfig,
  displayName: 'backend-unit',
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '/__tests__/unit/.*\\.(test|spec)\\.tsx?$',
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/../tests/setupBackend.ts'],
};

export default backendUnitConfig;
