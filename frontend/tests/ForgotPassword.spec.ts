import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import ForgotPassword from '../src/pages/ForgotPassword.vue'

describe('ForgotPassword.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // ensure fetch is harmless in case component falls back to fetch
    // @ts-expect-error -- test env
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
    // remove any previous test stub
    // @ts-expect-error -- test env
    delete (globalThis as any).__TEST_DEFAULT_SERVICE__
  })

  it('renders the form and button', () => {
    const wrapper = mount(ForgotPassword)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toMatch(/send|sending|reset/i)
  })

  it('shows confirmation when API succeeds', async () => {
    // stub the test-only hook so the component doesn't dynamic-import the client
    ;(globalThis as any).__TEST_DEFAULT_SERVICE__ = { postApiV1AuthForgotPassword: vi.fn().mockResolvedValue({}) }
    const wrapper = mount(ForgotPassword)
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await (wrapper.vm as any).onSubmit()

    expect((globalThis as any).__TEST_DEFAULT_SERVICE__.postApiV1AuthForgotPassword).toHaveBeenCalledWith({ email: 'user@example.com' })
    expect(wrapper.html()).toContain('If an account exists for this address')
    expect((wrapper.vm as any).sent).toBe(true)
    expect((wrapper.vm as any).loading).toBe(false)
  })

  it('shows error message when API fails', async () => {
    ;(globalThis as any).__TEST_DEFAULT_SERVICE__ = { postApiV1AuthForgotPassword: vi.fn().mockRejectedValue(new Error('network')) }
    const wrapper = mount(ForgotPassword)
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await (wrapper.vm as any).onSubmit()

    expect((globalThis as any).__TEST_DEFAULT_SERVICE__.postApiV1AuthForgotPassword).toHaveBeenCalled()
    expect(wrapper.html()).toContain('network')
    expect((wrapper.vm as any).error).toBe('network')
  })

  it('disables submit button while loading', async () => {
    let resolvePromise: (v?: any) => void
    const pending = new Promise((res) => { resolvePromise = res })
    ;(globalThis as any).__TEST_DEFAULT_SERVICE__ = { postApiV1AuthForgotPassword: vi.fn().mockImplementation(() => pending) }

    const wrapper = mount(ForgotPassword)
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    // call submit but do not await resolution
    const submitPromise = (wrapper.vm as any).onSubmit()

    await nextTick()
    const btn = wrapper.find('button[type="submit"]').element as HTMLButtonElement
    expect(btn.disabled).toBe(true)

    // resolve and finish
    resolvePromise!()
    await submitPromise
    await nextTick()
    // check reactive state instead of DOM property to avoid timing flakiness
    expect((wrapper.vm as any).loading).toBe(false)
  })
})
