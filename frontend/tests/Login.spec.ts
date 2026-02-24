import { mount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

const { window } = new JSDOM('<!doctype html><html><body></body></html>')
Object.defineProperty(globalThis, 'window', { value: window, configurable: true })
Object.defineProperty(globalThis, 'document', { value: window.document, configurable: true })
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
import { createPinia } from 'pinia'
import Login from '../src/pages/Login.vue'
// Mock the generated DefaultService to avoid loading the real client (can hang on import)
vi.mock('../src/api-client/services/DefaultService', () => ({
  // provide both top-level and `DefaultService` shapes used in tests/components
  postApiV1AuthLogin: vi.fn(),
  DefaultService: {},
}))
import * as DefaultService from '../src/api-client/services/DefaultService'
import { useUserStore } from '../src/stores/user'

// Ensure DefaultService exports exist so spies can attach safely
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ds = require('../src/api-client/services/DefaultService')
  if (!ds || !ds.DefaultService) {
    // create a simple fallback object
    module.exports = { DefaultService: {} }
  }
} catch {
  // ignore
}

describe('Login.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
  })

  it('logs in and sets token', async () => {
    // create the function if missing, then spy
    if (!(DefaultService as any).postApiV1AuthLogin) (DefaultService as any).postApiV1AuthLogin = vi.fn()
    const loginSpy = vi.spyOn(DefaultService as any, 'postApiV1AuthLogin').mockResolvedValue({ accessToken: 'tok123' })
    // debug logs to diagnose hangs
  
    const wrapper = mount(Login, {
      global: {
        plugins: [pinia],
        stubs: ['q-card', 'q-form', 'q-input', 'q-btn']
      }
    })
  

    const store = useUserStore(pinia)

    // fill fields
    // @ts-expect-error -- vue component internal vm properties
    wrapper.vm.email = 'a@b.com'
    // @ts-expect-error -- vue component internal vm properties
    wrapper.vm.password = 'Password123!'

    // call submit
    // @ts-expect-error -- vue component internal vm properties
  
    await wrapper.vm.onSubmit()
  

    expect(loginSpy).toHaveBeenCalled()
    expect(store.token).toBe('tok123')
  })

  it.todo('registers then auto-logins - Login.vue has no register mode; see Register.vue')
})
