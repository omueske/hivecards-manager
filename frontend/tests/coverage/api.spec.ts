import { describe, it, expect, vi } from 'vitest'

// Provide a safe mock for the generated DefaultService so importing the
// api module does not execute generated shim initialization that can
// trigger temporal-deadzone/init-order errors in some runners.
vi.mock('../../src/api-client/services/DefaultService', () => ({ DefaultService: {} }))

describe('api module', () => {
  it('configures OpenAPI', async () => {
    // Import lazily so mocks above take effect before module evaluation.
    await import('../../src/api')
    const OpenAPI = (await import('../../src/api-client/core/OpenAPI')).OpenAPI
    // BASE should be a string (fallback to http://localhost:3000 in test env)
    expect(typeof OpenAPI.BASE).toBe('string')
    expect(typeof OpenAPI.TOKEN).toBe('function')
  })
})
