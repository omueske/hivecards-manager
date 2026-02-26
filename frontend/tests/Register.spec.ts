import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
// Mock the generated API client to avoid heavy import-time work during test evaluation
vi.mock('../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    postApiV1AuthRegister: vi.fn(),
  },
}))
import Register from '../src/pages/Register.vue'
import { DefaultService } from '../src/api-client/services/DefaultService'

// the global setup covers vue-i18n and quasar components

describe('Register.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('toggles password visibility and validates rules/match', async () => {
    const wrapper = mount(Register)
    const vm: any = wrapper.vm

    // initial state
    expect(vm.showPassword).toBe(false)
    expect(vm.passwordRules.length).toBe(false)
    expect(vm.passwordsMatch).toBe(false)
    expect(vm.canSubmit).toBe(false)

    // type a short password
    vm.password = 'short'
    await wrapper.vm.$nextTick()
    expect(vm.passwordRules.length).toBe(false)
    expect(vm.canSubmit).toBe(false)

    // satisfy length rule
    vm.password = 'longenough'
    await wrapper.vm.$nextTick()
    expect(vm.passwordRules.length).toBe(true)

    // mismatch confirm
    vm.confirmPassword = 'other'
    await wrapper.vm.$nextTick()
    expect(vm.passwordsMatch).toBe(false)
    expect(vm.canSubmit).toBe(false)

    // match and fill email
    vm.confirmPassword = 'longenough'
    vm.email = 'a@b.com'
    await wrapper.vm.$nextTick()
    expect(vm.passwordsMatch).toBe(true)
    expect(vm.canSubmit).toBe(true)

    // toggle visibility button
    const btn = wrapper.find('button[type="button"]')
    await btn.trigger('click')
    expect(vm.showPassword).toBe(true)
  })

  it('submits successfully and shows registered message', async () => {
    const registerSpy = vi.spyOn(DefaultService, 'postApiV1AuthRegister').mockResolvedValue({} as any)

    const wrapper = mount(Register)
    const vm: any = wrapper.vm
    vm.email = 'user@foo.com'
    vm.password = 'longenough'
    vm.confirmPassword = 'longenough'

    await vm.onSubmit()
    expect(registerSpy).toHaveBeenCalledWith({
      email: 'user@foo.com',
      password: 'longenough',
      username: undefined,
    })
    expect(vm.registered).toBe(true)
  })

  it('handles "already registered" error specially', async () => {
    vi.spyOn(DefaultService, 'postApiV1AuthRegister')
      .mockRejectedValue({ body: { message: 'Already registered' } })

    const wrapper = mount(Register)
    const vm: any = wrapper.vm
    vm.email = 'user@foo.com'
    vm.password = 'longenough'
    vm.confirmPassword = 'longenough'

    await vm.onSubmit()
    expect(vm.error).toContain('already registered')
    expect(vm.errorIsEmailTaken).toBe(true)
  })

  it('refuses to submit if rules not met', async () => {
    const wrapper = mount(Register)
    const vm: any = wrapper.vm
    vm.email = 'foo@bar.com'
    vm.password = 'short'
    vm.confirmPassword = 'short'

    await vm.onSubmit()
    expect(vm.error).toContain('8 characters')
  })
})
