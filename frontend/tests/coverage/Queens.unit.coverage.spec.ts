import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'

// mock DefaultService before importing the component
vi.mock('../../src/api-client/services/DefaultService', () => {
  return {
    DefaultService: {
      getApiV1Queens: vi.fn(() => Promise.resolve({ items: [{ id: 'q1', name: 'Q1' }] })),
      getApiV1Apiaries: vi.fn(() => Promise.resolve([])),
      getApiV1Hives: vi.fn(() => Promise.resolve({ items: [{ id: '1', hiveNumber: 'H-001' }] })),
    },
  }
})

import Queens from '../../src/pages/Queens.vue'

test('Queens mounts and loads list (smoke)', async () => {
  const wrapper = shallowMount(Queens)
  // wait microtasks for onMounted async calls
  await Promise.resolve()
  await Promise.resolve()
  expect(wrapper.exists()).toBe(true)
})
