import { describe, it, expect } from 'vitest'
import { apiaryColor } from '../../src/utils/apiaryColor'

describe('apiaryColor', () => {
  it('returns storedColor when provided', () => {
    expect(apiaryColor('any', '#123456')).toBe('#123456')
  })

  it('returns fallback when id is undefined', () => {
    expect(apiaryColor(undefined)).toBe('#B0BEC5')
  })

  it('returns fallback when id is undefined and no storedColor', () => {
    expect(apiaryColor(undefined, undefined)).toBe('#B0BEC5')
  })

  it('derives a stable color from id without storedColor', () => {
    const a = apiaryColor('A-1')
    const b = apiaryColor('A-1')
    const c = apiaryColor('A-2')
    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it('derives color for different ids', () => {
    const colors = ['id-1', 'id-2', 'id-3', 'id-4', 'id-5'].map(id => apiaryColor(id))
    colors.forEach(c => {
      expect(c).toMatch(/^#[0-9A-F]{6}$/i)
      expect(typeof c).toBe('string')
    })
  })
})
