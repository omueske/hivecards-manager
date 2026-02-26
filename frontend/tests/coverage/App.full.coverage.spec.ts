import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { vi } from 'vitest'

// Mock DefaultService to avoid network/import side-effects
vi.mock('../../src/api-client/services/DefaultService', () => ({
  DefaultService: new Proxy({}, { get: (_t, p) => vi.fn() }),
}))

import App from '../../src/App.vue'

test('App mounts with Pinia (smoke)', () => {
  const pinia = createPinia()
  const wrapper = shallowMount(App, { global: { plugins: [pinia] } })
  expect(wrapper.exists()).toBe(true)
})
