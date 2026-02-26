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
  DefaultService: {
    postApiV1AuthLogin: vi.fn(),
  },
}))
import { DefaultService } from '../src/api-client/services/DefaultService'
import { useUserStore } from '../src/stores/user'

describe('Login.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
  })

  it('logs in and sets token', async () => {
    const loginSpy = vi.spyOn(DefaultService, 'postApiV1AuthLogin').mockResolvedValue({ accessToken: 'tok123' } as any)
  
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

    await wrapper.vm.onSubmit()

    expect(loginSpy).toHaveBeenCalled()
    expect(store.token).toBe('tok123')
  })

  it.todo('registers then auto-logins - Login.vue has no register mode; see Register.vue')
})
