import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getToken, setToken, clearToken } from '../../src/auth/token'

describe('Token Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('returns null when no token is stored', () => {
    expect(getToken()).toBe(null)
  })

  it('stores and retrieves token', () => {
    const testToken = 'test-jwt-token-123'
    setToken(testToken)
    expect(getToken()).toBe(testToken)
  })

  it('removes token when setToken is called with null', () => {
    setToken('initial-token')
    expect(getToken()).toBe('initial-token')
    
    setToken(null)
    expect(getToken()).toBe(null)
  })

  it('clears token with clearToken', () => {
    setToken('token-to-clear')
    expect(getToken()).toBe('token-to-clear')
    
    clearToken()
    expect(getToken()).toBe(null)
  })

  it('overwrites existing token when setToken is called again', () => {
    setToken('first-token')
    expect(getToken()).toBe('first-token')
    
    setToken('second-token')
    expect(getToken()).toBe('second-token')
  })
})
