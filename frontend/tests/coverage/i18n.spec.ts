import { describe, it, expect, vi } from 'vitest'

// Override the global mock from setupTests for this module so we can
// provide a createI18n implementation with a writable `global.locale.value`.
vi.mock('vue-i18n', () => {
  const en = require('../../src/locales/en.json')
  const de = require('../../src/locales/de.json')
  function createI18n() {
    return { global: { locale: { value: 'de' } }, install: vi.fn() }
  }
  return { createI18n, useI18n: () => ({ t: (k: string) => k }), default: { createI18n } }
})

import { i18n, setLocale } from '../../src/i18n'

describe('i18n', () => {
  it('sets locale and persists to localStorage', () => {
    localStorage.clear()
    setLocale('en')
    expect(localStorage.getItem('hc_lang')).toBe('en')
    // the mock createI18n sets initial locale; ensure the i18n object exists
    expect(i18n).toBeDefined()
  })
})
