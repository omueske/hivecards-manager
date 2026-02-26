import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock DefaultService before importing HiveDetail
vi.mock('../../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    getApiV1Hives: vi.fn(() => Promise.resolve({ items: [] })),
  },
}))

// Provide a route mock with params.id because HiveDetail reads `route.params.id` in setup
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useRoute: () => ({ params: { id: '1' } }),
  createRouter: () => ({ push: vi.fn(), beforeEach: vi.fn(), getRoutes: () => [] }),
  createMemoryHistory: () => ({}),
  createWebHistory: () => ({}),
  createWebHashHistory: () => ({}),
}))

import HiveDetail from '../../src/pages/HiveDetail.vue'

test('HiveDetail mounts (smoke)', async () => {
  const wrapper = shallowMount(HiveDetail)
  await Promise.resolve()
  expect(wrapper.exists()).toBe(true)
})
