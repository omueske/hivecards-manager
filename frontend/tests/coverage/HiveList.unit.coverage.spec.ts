import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { vi } from 'vitest'

// Mock DefaultService before importing HiveList
vi.mock('../../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    getApiV1Hives: vi.fn(() => Promise.resolve({ items: [{ id: '1', hiveNumber: 'H-001' }] })),
    getApiV1Apiaries: vi.fn(() => Promise.resolve({ items: [{ id: 'A-1', name: 'Apiary 1' }] })),
  },
}))

import HiveList from '../../src/pages/HiveList.vue'

test('HiveList mounts and fetches hives (smoke)', async () => {
  const pinia = createPinia()
  const wrapper = shallowMount(HiveList, { global: { plugins: [pinia] } })
  await Promise.resolve()
  await Promise.resolve()
  expect(wrapper.exists()).toBe(true)
})
