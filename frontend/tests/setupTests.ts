import { config } from '@vue/test-utils'
import { h } from 'vue'
import { vi } from 'vitest'

// Note: avoid globally clearing mocks here; doing so can remove mock
// implementations created above (e.g. `fetch`, Quasar) and cause tests
// to hang or attempt real network I/O. Individual tests should clear
// or reset mocks as needed.

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

// Provide a safe global fetch implementation for tests. Many components
// expect different response shapes (arrays, { items: [...] }, single
// objects). Return consistent, test-friendly shapes per endpoint so
// tests don't accidentally call real network or receive unexpected
// structures. Always replace the global `fetch` in the test environment
// to avoid accidental real network calls (Node 18+ has a native fetch).
globalThis.fetch = vi.fn(async (url: any, opts?: any) => {
    const s = String(url || '')
    const method = (opts && opts.method) || 'GET'

    if (s.includes('/api/v1/treatment-agents')) {
      if (method === 'POST') return { ok: true, json: async () => ({ id: 'a1', name: JSON.parse(opts.body).name || 'AgentX' }) }
      return { ok: true, json: async () => [{ id: 'a1', name: 'Agent1' }, { id: 'a2', name: 'Agent2' }] }
    }

    if (s.includes('/api/v1/apiaries')) {
      if (method === 'POST') return { ok: true, json: async () => ({ id: 'api-1', name: JSON.parse(opts.body).name || 'Api' }) }
      // many callers expect an array of apiaries
      return { ok: true, json: async () => [{ id: 'A-1', name: 'Home' }, { id: 'A-2', name: 'Field' }] }
    }

    if (s.includes('/api/v1/hives')) {
      // hive list endpoints return an object with `items` property
      return { ok: true, json: async () => ({ items: [{ id: 'h1', hiveNumber: 'H-1', apiaryId: 'A-1', status: 'active' }] }) }
    }

    if (s.includes('/api/v1/inspections')) {
      if (method === 'PUT') return { ok: true, json: async () => ({}) }
      return { ok: true, json: async () => ({ id: 'i1' }) }
    }

    if (s.includes('/api/v1/auth/refresh')) {
      return { ok: false, json: async () => ({}) }
    }

    // fallback: prefer array since many consumers call `.map` or `.forEach`.
    return { ok: true, json: async () => [] }
  }) as any

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

// add more Quasar components observed in warnings
quasarTags.push(
  'q-header',
  'q-footer',
  'q-layout',
  'q-page-container',
  'q-route-tab',
  'q-tabs',
  'q-avatar',
  'q-date',
  'q-popup-proxy',
  'q-checkbox',
  'q-item',
  'q-item-section',
)

quasarTags.forEach((t) => {
  // @ts-expect-error -- dynamic component registration not typed on global config
  if (t === 'q-form') {
    // q-form exposes a `validate()` method via its component instance.
    // Provide a default implementation so template refs receive an
    // object with `validate()` available; tests can override this.
    // @ts-expect-error
    config.global.components[t] = {
      name: t,
      methods: {
        validate() {
          return true
        },
      },
      render() {
        // @ts-expect-error -- $slots not typed on plain object component
        return h('div', this.$slots.default ? this.$slots.default() : [])
      },
    }
  } else {
    // @ts-expect-error -- dynamic component registration not typed on global config
    config.global.components[t] = {
      name: t,
      render() {
        // @ts-expect-error -- $slots not typed on plain object component
        return h('div', this.$slots.default ? this.$slots.default() : [])
      },
    }
  }
})

// Provide a global stub for router-link so it doesn't cause resolution errors
// @ts-expect-error -- dynamic component registration not typed on global config
config.global.stubs['router-link'] = { template: '<a><slot /></a>' }
// @ts-expect-error -- dynamic component registration not typed on global config
config.global.stubs['RouterLink'] = { template: '<a><slot /></a>' }
// stub router-view used by App.vue
// @ts-expect-error -- dynamic component registration not typed on global config
config.global.stubs['router-view'] = { template: '<div />' }
// also uppercase form
// @ts-expect-error
config.global.stubs['RouterView'] = { template: '<div />' }

// stub common Quasar directives used by templates (e.g. ClosePopup)
config.global.directives = config.global.directives || {}
// simple noop directive
config.global.directives['close-popup'] = {}

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
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
    useRoute: () => ({ query: {} }),
    // createRouter should accept an options object so the real module can
    // register guards and consumers can call `getRoutes()` to inspect routes.
    createRouter: (opts?: any) => {
      const guard = { fn: null as any }
      return {
        push: vi.fn(),
        beforeEach(fn: any) {
          guard.fn = fn
        },
        // expose getRoutes so tests can assert routes were registered
        getRoutes() {
          return (opts && opts.routes) || []
        },
      }
    },
    createMemoryHistory: () => ({}),
    createWebHistory: () => ({}),
    createWebHashHistory: () => ({}),
  }
})

// Mock Quasar to avoid runtime dynamic import side-effects in tests
vi.mock('quasar', () => {
  // a minimal plugin object acceptable to `app.use(Quasar, ...)`
  const Quasar = { install: vi.fn() }
  return {
    Quasar,
    default: Quasar,
    Notify: { create: vi.fn() },
    useQuasar: () => ({ notify: vi.fn() }),
    ClosePopup: {},
  }
})

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
});

// Pre-import commonly dynamically-imported modules so `import('quasar')` and
// `import('../src/api-client/services/DefaultService')` resolve to the
// above mocks during test execution. This avoids hangs where the dynamic
// import attempts to resolve the real module or worker resolution stalls.
// NOTE: avoid preloading modules via a startup IIFE — mocking with `vi.mock`
// above is sufficient for dynamic `import()` resolution. Preloading caused
// Rollup/Vite parse/runtime issues in some environments.
