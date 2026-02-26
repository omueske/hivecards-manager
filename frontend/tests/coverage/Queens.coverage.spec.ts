import { vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'

// Mock DefaultService to avoid real network calls during component mount
vi.mock('../../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    getApiV1Queens: async () => [],
    getApiV1Hives: async () => ({ items: [] }),
    postApiV1QueensAssign: async () => ({}),
    deleteApiV1Queens: async () => ({}),
  },
}))

import Queens from '../../src/pages/Queens.vue'

test('Queens mounts (smoke)', async () => {
  const wrapper = shallowMount(Queens, { global: { stubs: ['q-table', 'q-btn', 'q-icon', 'q-dialog', 'q-select'] } })
  expect(wrapper.exists()).toBe(true)
})
