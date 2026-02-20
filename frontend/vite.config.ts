import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE || '/',
    plugins: [vue()],
    server: {
      port: 5173,
      fs: {
        // Allow importing files from the monorepo root (e.g. CHANGELOG.md)
        allow: [resolve(__dirname, '..'), __dirname],
      },
    },
  }
})
