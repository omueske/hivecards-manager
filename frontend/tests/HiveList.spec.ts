import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

// ensure a DOM is available for @vue/test-utils when running under Node
const { window } = new JSDOM('<!doctype html><html><body></body></html>')
Object.defineProperty(globalThis, 'window', { value: window, configurable: true })
Object.defineProperty(globalThis, 'document', { value: window.document, configurable: true })
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
import { mount } from '@vue/test-utils'
import HiveList from '../src/pages/HiveList.vue'
import { setToken } from '../src/auth/token'
import { createPinia } from 'pinia'

// provide a simple global localStorage for jsdom-less test runs
if (typeof globalThis.localStorage === 'undefined') {
  const _store: Record<string,string> = {}
  globalThis.localStorage = {
    getItem: (k: string) => (_store[k] ?? null),
    setItem: (k: string, v: string) => { _store[k] = String(v) },
    removeItem: (k: string) => { delete _store[k] }
  } as any
}

vi.mock('../src/api-client/services/DefaultService', () => {
  return {
    DefaultService: {
      getApiV1Hives: vi.fn(() => Promise.resolve({ items: [
        { id: '1', hiveNumber: 'H-001', status: 'active', apiaryId: 'A-1', frameCount: 10, notes: 'Test hive' }
      ] })),
      getApiV1Apiaries: vi.fn(() => Promise.resolve({ items: [] }))
    }
  }
})

describe('HiveList', () => {
  beforeEach(() => {
    setToken('test-token')
  })

  it('renders hive cards when API returns items', async () => {
    const wrapper = mount(HiveList, {
      global: {
        plugins: [createPinia()],
        mocks: {
          $router: {
            push: vi.fn(),
            replace: vi.fn(),
            currentRoute: { value: { path: '/' } }
          },
          $route: {
            path: '/',
            params: {},
            query: {}
          }
        }
      }
    })

    // wait for the onMounted fetch to resolve
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.html()).toContain('H-001')
    expect(wrapper.text()).toContain('Location: A-1')
  })
})
