import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setupTests.ts',
    globals: true,
    include: ['tests/**/*.spec.ts'],
    pool: 'threads',
    singleThread: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**/*.vue', 'src/**/*.ts'],
      // Exclude generated API client and type-only files which cannot be meaningfully covered
      exclude: [
        '**/node_modules/**',
        'src/main.ts',
        'src/api-client/**',
        'src/**/*.d.ts',
        'src/vite-env.d.ts'
      ],
      reportsDirectory: '../coverage/frontend',
    },
  },
})
