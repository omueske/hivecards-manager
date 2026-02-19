import { mount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

const { window } = new JSDOM('<!doctype html><html><body></body></html>')
Object.defineProperty(globalThis, 'window', { value: window, configurable: true })
Object.defineProperty(globalThis, 'document', { value: window.document, configurable: true })
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
import { createPinia } from 'pinia'
import Login from '../src/pages/Login.vue'
import * as DefaultService from '../src/api-client/services/DefaultService'
import { useUserStore } from '../src/stores/user'

// Ensure DefaultService exports exist so spies can attach safely
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ds = require('../src/api-client/services/DefaultService')
  if (!ds || !ds.DefaultService) {
    // create a simple fallback object
    module.exports = { DefaultService: {} }
  }
} catch (e) {
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

    const wrapper = mount(Login, {
      global: {
        plugins: [pinia],
        stubs: ['q-card', 'q-form', 'q-input', 'q-btn']
      }
    })

    const store = useUserStore(pinia)

    // fill fields
    // @ts-ignore
    wrapper.vm.email = 'a@b.com'
    // @ts-ignore
    wrapper.vm.password = 'Password123!'

    // call submit
    // @ts-ignore
    await wrapper.vm.onSubmit()

    expect(loginSpy).toHaveBeenCalled()
    expect(store.token).toBe('tok123')
  })

  it('registers then auto-logins', async () => {
    if (!(DefaultService as any).postApiV1AuthRegister) (DefaultService as any).postApiV1AuthRegister = vi.fn()
    if (!(DefaultService as any).postApiV1AuthLogin) (DefaultService as any).postApiV1AuthLogin = vi.fn()
    const regSpy = vi.spyOn(DefaultService as any, 'postApiV1AuthRegister').mockResolvedValue({ id: 'u1', email: 'a@b.com' })
    const loginSpy = vi.spyOn(DefaultService as any, 'postApiV1AuthLogin').mockResolvedValue({ accessToken: 'tokReg' })

    const wrapper = mount(Login, {
      global: {
        plugins: [pinia],
        stubs: ['q-card', 'q-form', 'q-input', 'q-btn']
      }
    })

    const store = useUserStore(pinia)

    // set to register mode
    // @ts-ignore
    wrapper.vm.mode = 'register'
    // @ts-ignore
    wrapper.vm.email = 'reg@b.com'
    // @ts-ignore
    wrapper.vm.password = 'Password123!'
    // @ts-ignore
    wrapper.vm.username = 'reguser'

    // call submit
    // @ts-ignore
    await wrapper.vm.onSubmit()

    expect(regSpy).toHaveBeenCalled()
    expect(loginSpy).toHaveBeenCalled()
    expect(store.token).toBe('tokReg')
  })
})
