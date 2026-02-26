import { vi, describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'

// Mock route before importing component
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'h1' } }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), currentRoute: { value: { fullPath: '/' } } }),
  createRouter: () => ({ beforeEach: vi.fn(), getRoutes: () => [] }),
  createMemoryHistory: () => ({}),
  createWebHistory: () => ({}),
  createWebHashHistory: () => ({}),
}))

// Mock DefaultService
vi.mock('../../src/api-client/services/DefaultService', () => {
  const DefaultService = {
    getApiV1Hives1: vi.fn().mockResolvedValue({ id: 'h1', hiveNumber: 'H-1', apiaryId: 'a1', status: 'active' }),
    getApiV1Apiaries1: vi.fn().mockResolvedValue({ id: 'a1', name: 'Apiary 1' }),
    getApiV1Inspections: vi.fn().mockResolvedValue({ items: [{ id: 'i1', date: '2020-01-02', type: 'inspection' }] }),
    getApiV1Queens: vi.fn().mockResolvedValue([{ id: 'q1', name: 'Q1', hiveHistory: [{ hiveId: 'h1' }] }]),
    deleteApiV1Inspections: vi.fn().mockResolvedValue({}),
    postApiV1QueensAssign: vi.fn().mockResolvedValue({ id: 'q1', name: 'Q1' }),
  }
  return { DefaultService }
})

import HiveDetail from '../../src/pages/HiveDetail.vue'

describe('HiveDetail.vue (mount)', () => {
  it('loads hive, inspections and queens on mount', async () => {
    const pinia = createPinia()
    const wrapper = shallowMount(HiveDetail as any, { global: { plugins: [pinia] } })
    await new Promise((r) => setTimeout(r, 0))
    await Promise.resolve()

    expect((wrapper.vm as any).hive).toBeTruthy()
    expect((wrapper.vm as any).inspections.length).toBeGreaterThan(0)
    expect((wrapper.vm as any).queens.length).toBeGreaterThan(0)
    // formatDate helper
    expect((wrapper.vm as any).formatDate('2020-01-02')).toContain('02.')
  })
})
