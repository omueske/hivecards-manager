import { vi, describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'

// Mock DefaultService
vi.mock('../../src/api-client/services/DefaultService', () => {
  const DefaultService = {
    getApiV1Hives: vi.fn().mockResolvedValue({ items: [{ id: 'h1', hiveNumber: 'H-1', apiaryId: 'a1', status: 'active' }] }),
    getApiV1Apiaries: vi.fn().mockResolvedValue([{ id: 'a1', name: 'Apiary 1', color: '#ff0000' }]),
    putApiV1Hives: vi.fn().mockResolvedValue({}),
    deleteApiV1Hives: vi.fn().mockResolvedValue({}),
  }
  return { DefaultService }
})

import HiveList from '../../src/pages/HiveList.vue'
import { useUserStore } from '../../src/stores/user'

describe('HiveList.vue (mount)', () => {
  it('loads hives and apiaries when token present', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    // set token so onMounted triggers fetch
    store.token = 'tok'

    const wrapper = shallowMount(HiveList as any, { global: { plugins: [pinia] } })
    await new Promise((r) => setTimeout(r, 0))
    await Promise.resolve()

    expect((wrapper.vm as any).hives.length).toBeGreaterThan(0)
    expect(Object.keys((wrapper.vm as any).apiaries).length).toBeGreaterThan(0)
    // grouped should contain the apiary key
    const g = (wrapper.vm as any).grouped
    expect(Object.keys(g).length).toBeGreaterThan(0)
  })
})
