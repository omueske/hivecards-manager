import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE || '/',
    plugins: [vue()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('/quasar/')) return 'vendor-quasar';
            if (id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/pinia/')) {
              return 'vendor-vue';
            }
            if (id.includes('/vue-i18n/')) return 'vendor-i18n';
            if (id.includes('/marked/')) return 'vendor-marked';
            if (id.includes('/axios/')) return 'vendor-axios';
          },
        },
      },
    },
    server: {
      port: 5173,
      fs: {
        // Allow importing files from the monorepo root (e.g. CHANGELOG.md)
        allow: [resolve(__dirname, '..'), __dirname],
      },
    },
  }
})
