import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ResetPassword from '../src/pages/ResetPassword.vue'

describe('ResetPassword.vue', () => {
  it('shows missing token message when none present', () => {
    const wrapper = mount(ResetPassword, {
      global: {
        mocks: { $route: { query: {} } },
      },
    })
    expect(wrapper.text()).toContain('Invalid link')
  })

  it('validates rules and submits successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    const wrapper = mount(ResetPassword, {
      global: {
        mocks: { $route: { query: { token: 'tok' } } },
      },
    })
    const vm: any = wrapper.vm
    vm.password = 'longenough'
    vm.confirmPassword = 'longenough'
    await vm.onSubmit()
    expect(vm.done).toBe(true)
  })

  it('shows error on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'))
    const wrapper = mount(ResetPassword, {
      global: {
        mocks: { $route: { query: { token: 'tok' } } },
      },
    })
    const vm: any = wrapper.vm
    vm.password = 'longenough'
    vm.confirmPassword = 'longenough'
    await vm.onSubmit()
    expect(vm.error).toContain('fail')
  })
})