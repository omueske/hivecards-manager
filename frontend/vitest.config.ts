import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setupTests.ts',
    globals: true,
    include: ['tests/**/*.spec.ts'],
    // Use forks for CI-friendly parallelism. Was temporarily set to 'none' for debugging.
    pool: 'forks',
    forks: { singleFork: true },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**/*.vue', 'src/**/*.ts'],
      exclude: ['**/node_modules/**', 'src/main.ts'],
      reportsDirectory: '../coverage/frontend',
    },
  },
})
