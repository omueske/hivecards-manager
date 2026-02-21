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
vi.mock('quasar', () => ({ Notify: { create: vi.fn() } }))

// Provide a default mock for the generated API client service so tests can spy on
// and control individual methods without failing when the real client isn't
// initialized in the test environment.
vi.mock('../src/api-client/services/DefaultService', () => ({
  postApiV1AuthLogin: vi.fn(),
  postApiV1AuthRegister: vi.fn(),
  getApiV1Hives: vi.fn(),
  postApiV1Hives: vi.fn(),
  DefaultService: {
    postApiV1AuthLogin: vi.fn(),
    postApiV1AuthRegister: vi.fn(),
    getApiV1Hives: vi.fn(),
    postApiV1Hives: vi.fn(),
  },
}))
