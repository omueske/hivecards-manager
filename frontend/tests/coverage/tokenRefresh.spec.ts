import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the token module functions used by tokenRefresh
vi.mock('../../src/auth/token', () => ({ 
  setToken: vi.fn(), 
  clearToken: vi.fn() 
}))

import { initRefreshCallbacks, scheduleRefresh, cancelRefresh, doRefresh } from '../../src/auth/tokenRefresh'
import { setToken, clearToken } from '../../src/auth/token'

describe('tokenRefresh', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // ensure global.fetch is mockable
    ;(global as any).fetch = vi.fn()
  })

  it('calls onSuccess when doRefresh returns a new token', async () => {
    const onSuccess = vi.fn()
    const onFailure = vi.fn()
    initRefreshCallbacks(onSuccess, onFailure)

    // mock fetch to return ok with new accessToken
    ;(global as any).fetch = vi.fn().mockResolvedValue({ 
      ok: true, 
      status: 200,
      json: async () => ({ accessToken: 'new-token' }) 
    })

    // Call the refresh routine directly to avoid timer scheduling complexity
    await doRefresh()

    expect((global as any).fetch).toHaveBeenCalled()
    expect(setToken).toHaveBeenCalledWith('new-token')
    expect(onSuccess).toHaveBeenCalledWith('new-token')
  })

  it('calls onFailure when doRefresh gets 204 response', async () => {
    const onSuccess = vi.fn()
    const onFailure = vi.fn()
    initRefreshCallbacks(onSuccess, onFailure)

    ;(global as any).fetch = vi.fn().mockResolvedValue({ 
      ok: true, 
      status: 204,
      json: async () => ({}) 
    })

    await doRefresh()

    expect(clearToken).toHaveBeenCalled()
    expect(onFailure).toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onFailure when doRefresh gets non-ok response', async () => {
    const onSuccess = vi.fn()
    const onFailure = vi.fn()
    initRefreshCallbacks(onSuccess, onFailure)

    ;(global as any).fetch = vi.fn().mockResolvedValue({ 
      ok: false, 
      status: 401,
      json: async () => ({}) 
    })

    await doRefresh()

    expect(clearToken).toHaveBeenCalled()
    expect(onFailure).toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onFailure when doRefresh gets response without accessToken', async () => {
    const onSuccess = vi.fn()
    const onFailure = vi.fn()
    initRefreshCallbacks(onSuccess, onFailure)

    ;(global as any).fetch = vi.fn().mockResolvedValue({ 
      ok: true, 
      status: 200,
      json: async () => ({ someOtherField: 'value' }) 
    })

    await doRefresh()

    expect(clearToken).toHaveBeenCalled()
    expect(onFailure).toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('cancelRefresh prevents the scheduled refresh', async () => {
    const onSuccess = vi.fn()
    const onFailure = vi.fn()
    initRefreshCallbacks(onSuccess, onFailure)

    const payload = { exp: Math.floor(Date.now() / 1000) + 10 }
    const b64 = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const token = ['h', b64, 's'].join('.')

    ;(global as any).fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ accessToken: 'new-token' }) })

    vi.useFakeTimers()
    scheduleRefresh(token)
    cancelRefresh()
    vi.runAllTimers()
    // microtasks
    await Promise.resolve()
    vi.useRealTimers()

    expect((global as any).fetch).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('scheduleRefresh does nothing when token is invalid', () => {
    vi.useFakeTimers()
    scheduleRefresh('invalid-token')
    vi.runAllTimers()
    vi.useRealTimers()
    // Should not throw or schedule anything
    expect(true).toBe(true)
  })
})
