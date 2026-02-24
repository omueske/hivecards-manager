import { config } from '@vue/test-utils'
import { h } from 'vue'
import { vi } from 'vitest'

// Polyfill simple localStorage for tests
if (!globalThis.localStorage) {
  const store: Record<string, string> = {}
  globalThis.localStorage = {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    },
    setItem(key: string, value: string) {
      store[key] = String(value)
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      for (const k of Object.keys(store)) delete store[k]
    },
  } as Storage
}

// Minimal navigator
if (!globalThis.navigator) {
  // @ts-expect-error -- navigator not on globalThis type in test env
  globalThis.navigator = { userAgent: 'node.js' }
}

// Create lightweight functional stubs that render their default slot so
// component templates still render meaningful inner HTML during tests.
const quasarTags = [
  'q-btn',
  'q-toolbar',
  'q-toolbar-title',
  'q-tooltip',
  'q-space',
  'q-card',
  'q-card-section',
  'q-card-actions',
  'q-spinner',
  'q-separator',
  'q-page',
  'q-input',
  'q-select',
  'q-form',
  'q-dialog',
  'q-chip',
  'q-badge',
  'q-toggle',
  'q-icon',
  'q-table',
  'q-td',
  'q-btn-toggle',
  'q-timeline',
  'q-timeline-entry',
]

quasarTags.forEach((t) => {
  // @ts-expect-error -- dynamic component registration not typed on global config
  config.global.components[t] = {
    name: t,
    render() {
      // @ts-expect-error -- $slots not typed on plain object component
      return h('div', this.$slots.default ? this.$slots.default() : [])
    },
  }
})

// Provide a global stub for router-link so it doesn't cause resolution errors
// @ts-expect-error -- dynamic component registration not typed on global config
config.global.stubs['router-link'] = { template: '<a><slot /></a>' }
// @ts-expect-error -- dynamic component registration not typed on global config
config.global.stubs['RouterLink'] = { template: '<a><slot /></a>' }

// ensure $t is available on component instances (used by Profile.vue template)
config.global.config.globalProperties = config.global.config.globalProperties || {}
// @ts-expect-error
config.global.config.globalProperties.$t = (k: string) => k

// Mock vue-i18n so components using useI18n() work without app.use(i18n)
vi.mock('vue-i18n', async () => {
  const en = (await import('../src/locales/en.json')) as Record<string, any>
  function t(key: string): string {
    const parts = key.split('.')
    let cur: any = en
    for (const part of parts) {
      if (cur && typeof cur === 'object' && part in cur) {
        cur = cur[part]
      } else {
        return key
      }
    }
    return typeof cur === 'string' ? cur : key
  }
  return {
    useI18n: () => ({ t }),
    createI18n: vi.fn(() => ({ install: vi.fn() })),
  }
})

// Provide a basic vue-router mock so components using useRouter/useRoute work
vi.mock('vue-router', () => {
  return {
    useRouter: () => ({ push: vi.fn() }),
    useRoute: () => ({ query: {} }),
    createRouter: () => ({ push: vi.fn() }),
    createMemoryHistory: () => ({}),
  }
})

// Mock Quasar's Notify to avoid runtime dynamic import side-effects in tests
vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
  useQuasar: () => ({ notify: vi.fn() }),
}))

// Provide a default mock for the generated API client service so tests can spy on
// and control individual methods without failing when the real client isn't
// initialized in the test environment. A Proxy ensures any property access
// returns a `vi.fn()` so we never miss a method.
vi.mock('../src/api-client/services/DefaultService', () => {
  const handler = {
    get(_target: any, prop: string) {
      if (!(prop in _target)) {
        _target[prop] = vi.fn()
      }
      return _target[prop]
    },
  }
  const proxy = new Proxy({}, handler)
  proxy.DefaultService = new Proxy({}, handler)
  return proxy
})
