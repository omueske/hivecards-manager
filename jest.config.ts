// root jest config that delegates to per-project configs
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'node', // default for root, avoids jest requiring jsdom module
  projects: [
    '<rootDir>/jest.backend-unit.config.ts',
    '<rootDir>/jest.backend-integ.config.ts',
    // frontend tests can be run separately via `npm run test:frontend`
    // '<rootDir>/jest.frontend.config.ts',
  ],
};

export default config;
