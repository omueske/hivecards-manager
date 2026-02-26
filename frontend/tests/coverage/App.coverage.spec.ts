import { vi, test, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'

vi.mock('../../src/api-client/services/DefaultService', () => ({
  DefaultService: new Proxy({}, { get: () => vi.fn() }),
}))

import App from '../../src/App.vue'

test('App mounts (smoke)', () => {
  const wrapper = shallowMount(App, {
    global: {
      plugins: [createPinia()],
      stubs: ['router-view', 'router-link', 'q-header', 'q-page-container', 'q-route-tab', 'q-tabs', 'q-footer', 'q-layout', 'q-page'],
    },
  })
  expect(wrapper.exists()).toBe(true)
})
