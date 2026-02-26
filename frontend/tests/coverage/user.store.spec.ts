import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock token functions - must use factory functions for hoisting
vi.mock('../../src/auth/token', () => {
  const mockGetToken = vi.fn(() => null)
  const mockSetInMemoryToken = vi.fn()
  const mockClearToken = vi.fn()
  
  return {
    getToken: mockGetToken,
    setToken: mockSetInMemoryToken,
    clearToken: mockClearToken,
  }
})

// Mock token refresh - must use factory functions for hoisting
vi.mock('../../src/auth/tokenRefresh', () => {
  let refreshCallbacks: any = {}
  
  return {
    scheduleRefresh: vi.fn(),
    cancelRefresh: vi.fn(),
    initRefreshCallbacks: (onToken: any, onExpired: any) => {
      refreshCallbacks.onToken = onToken
      refreshCallbacks.onExpired = onExpired
    },
    // Export for testing
    __getCallbacks: () => refreshCallbacks
  }
})

import { useUserStore } from '../../src/stores/user'
import * as tokenModule from '../../src/auth/token'
import * as tokenRefreshModule from '../../src/auth/tokenRefresh'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(tokenModule.getToken).mockReturnValue(null)
    localStorage.clear()
  })

  it('initializes token from getToken', () => {
    vi.mocked(tokenModule.getToken).mockReturnValue('initial-token')
    const store = useUserStore()
    expect(store.token).toBe('initial-token')
  })

  it('sets token and schedules refresh', () => {
    const store = useUserStore()
    const testToken = 'new-test-token'
    
    store.setToken(testToken)
    
    expect(store.token).toBe(testToken)
    expect(tokenModule.setToken).toHaveBeenCalledWith(testToken)
    expect(tokenRefreshModule.scheduleRefresh).toHaveBeenCalledWith(testToken)
  })

  it('handles setToken error gracefully', () => {
    vi.mocked(tokenModule.setToken).mockImplementation(() => {
      throw new Error('Storage error')
    })
    
    const store = useUserStore()
    
    // Should not throw
    expect(() => store.setToken('test-token')).not.toThrow()
    expect(store.token).toBe('test-token')
  })

  it('clears token and cancels refresh', () => {
    const store = useUserStore()
    store.setToken('token-to-clear')
    
    store.clear()
    
    expect(store.token).toBe(null)
    expect(tokenModule.clearToken).toHaveBeenCalled()
    expect(tokenRefreshModule.cancelRefresh).toHaveBeenCalled()
    expect(localStorage.getItem('hc_has_refresh')).toBe(null)
  })

  it('handles clear error gracefully', () => {
    vi.mocked(tokenModule.clearToken).mockImplementation(() => {
      throw new Error('Storage error')
    })
    
    const store = useUserStore()
    store.setToken('test-token')
    
    // Should not throw
    expect(() => store.clear()).not.toThrow()
    expect(store.token).toBe(null)
  })

  it('updates token via refresh callback', () => {
    const store = useUserStore()
    const newToken = 'refreshed-token'
    
    // Get callbacks from the mock module
    const callbacks = (tokenRefreshModule as any).__getCallbacks()
    
    // Simulate token refresh callback
    callbacks.onToken(newToken)
    
    expect(store.token).toBe(newToken)
  })

  it('clears token and redirects on expired callback', () => {
    const store = useUserStore()
    store.setToken('expired-token')
    
    // Mock window.location
    const originalLocation = window.location
    delete (window as any).location
    window.location = { ...originalLocation, pathname: '/hives', href: '' } as any
    
    // Get callbacks from the mock module
    const callbacks = (tokenRefreshModule as any).__getCallbacks()
    
    // Simulate token expired callback
    callbacks.onExpired()
    
    expect(store.token).toBe(null)
    expect(window.location.href).toBe('/login')
    
    // Restore
    window.location = originalLocation
  })

  it('does not redirect if already on login page', () => {
    const store = useUserStore()
    store.setToken('expired-token')
    
    // Mock window.location
    const originalLocation = window.location
    delete (window as any).location
    window.location = { ...originalLocation, pathname: '/login', href: '/login' } as any
    
    // Get callbacks from the mock module
    const callbacks = (tokenRefreshModule as any).__getCallbacks()
    
    // Simulate token expired callback
    callbacks.onExpired()
    
    expect(store.token).toBe(null)
    expect(window.location.href).toBe('/login') // Should remain unchanged
    
    // Restore
    window.location = originalLocation
  })
})
