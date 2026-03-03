import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Profile from '../src/pages/Profile.vue'
import { setToken, clearToken } from '../src/auth/token'

// Helpers to fabricate a JWT with exp claim
function makeToken(payload: Record<string, any>) {
  const encode = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `hdr.${encode(payload)}.sig`
}

describe('Profile.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearToken()
    // reset fetch mock
    global.fetch = vi.fn()
  })

  it('fetches profile data on mount and updates form', async () => {
    const user = { email: 'foo@bar.com', username: 'bee' }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => user,
    })

    // provide a token that expires in 90 seconds
    const now = Math.floor(Date.now() / 1000)
    setToken(makeToken({ exp: now + 90 }))

    const wrapper = mount(Profile)
    // wait for mounted fetchProfile to finish
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    const vm: any = wrapper.vm
    expect(vm.form.email).toBe(user.email)
    expect(vm.form.username).toBe(user.username)
    expect(vm.loading).toBe(false)
  })

  it('computes remaining/next refresh labels from token', () => {
    // fake token that expires 75 seconds from now
    const now = Math.floor(Date.now() / 1000)
    setToken(makeToken({ exp: now + 75 }))
    const wrapper = mount(Profile)
    const vm: any = wrapper.vm

    // remaining seconds should be around 75
    expect(vm.tokenRemainingSeconds).toBeGreaterThan(70)
    expect(vm.tokenRemainingLabel).toMatch(/m/) // minutes part
    expect(vm.remainingColor).toBe('#f9a825') // between 60 and 120 seconds

    // with token exp 75s ahead, refreshAt = exp-60 = now+15
    expect(vm.nextRefreshLabel).toBe('15s')
  })

  it('refreshNow triggers API call and toggles refreshing flag', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const wrapper = mount(Profile)
    const vm: any = wrapper.vm

    const promise = vm.refreshNow()
    expect(vm.refreshing).toBe(true)
    await promise
    expect(vm.refreshing).toBe(false)
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/auth/refresh'), expect.any(Object))
  })
})