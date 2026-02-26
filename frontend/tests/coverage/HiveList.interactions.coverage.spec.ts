import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useUserStore } from '../../src/stores/user'

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

const mockGetHives = vi.fn()
const mockGetApiaries = vi.fn()
const mockPutHive = vi.fn()
const mockDeleteHive = vi.fn()

vi.mock('../../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    getApiV1Hives: (...args: any[]) => mockGetHives(...args),
    getApiV1Apiaries: () => mockGetApiaries(),
    putApiV1Hives: (id: string, data: any) => mockPutHive(id, data),
    deleteApiV1Hives: (id: string) => mockDeleteHive(id),
  },
}))

const mockRouterPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}))

vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn()
  }
}))

import HiveList from '../../src/pages/HiveList.vue'

describe('HiveList Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetHives.mockResolvedValue({ items: [] })
    mockGetApiaries.mockResolvedValue({ items: [] })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('calls goTo with hive id when navigating', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    mockGetHives.mockResolvedValue({
      items: [{ id: 'h1', hiveNumber: 'H-001', status: 'active' }]
    })

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })

    await flushPromises()
    
    // Simulate clicking a hive card to navigate
    const vm = wrapper.vm as any
    vm.goTo('h1')
    
    expect(mockRouterPush).toHaveBeenCalledWith('/hives/h1')
  })

  it('opens create dialog when openCreate is called', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const vm = wrapper.vm as any
    vm.openCreate()

    expect(vm.createVisible).toBe(true)
    expect(vm.editHive).toBe(null)
  })

  it('opens edit dialog with hive data when openEdit is called', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    const hive = { id: 'h1', hiveNumber: 'H-001', status: 'active' }

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const vm = wrapper.vm as any
    vm.openEdit(hive)

    expect(vm.createVisible).toBe(true)
    expect(vm.editHive).toStrictEqual(hive)
  })

  it('toggles showArchived and refetches hives', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    // Initially fetches active hives
    expect(mockGetHives).toHaveBeenCalledWith(undefined, undefined, 'active')

    // Toggle showArchived
    const vm = wrapper.vm as any
    vm.showArchived = true
    await flushPromises()

    // Should fetch again without status filter
    expect(mockGetHives).toHaveBeenCalledWith(undefined, undefined, undefined)
  })

  it('calls fetch when onCreated callback is triggered', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const initialCalls = mockGetHives.mock.calls.length

    const vm = wrapper.vm as any
    vm.onCreated()
    await flushPromises()

    expect(mockGetHives.mock.calls.length).toBe(initialCalls + 1)
  })

  it('calls fetch when onUpdated callback is triggered', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const initialCalls = mockGetHives.mock.calls.length

    const vm = wrapper.vm as any
    vm.onUpdated()
    await flushPromises()

    expect(mockGetHives.mock.calls.length).toBe(initialCalls + 1)
  })

  it('computes apiaryColors correctly', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    mockGetApiaries.mockResolvedValue({
      items: [{ id: 'a1', name: 'Apiary 1', color: '#ff0000' }]
    })

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const vm = wrapper.vm as any
    const colors = vm.apiaryColors

    expect(colors).toHaveProperty('a1')
    expect(colors.__no_location).toBe('#B0BEC5')
  })

  it('computes grouped hives by apiary', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    mockGetHives.mockResolvedValue({
      items: [
        { id: 'h1', hiveNumber: 'H-001', apiaryId: 'a1' },
        { id: 'h2', hiveNumber: 'H-002', apiaryId: 'a1' },
        { id: 'h3', hiveNumber: 'H-003', apiaryId: null },
      ]
    })

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const vm = wrapper.vm as any
    const grouped = vm.grouped

    expect(grouped.a1).toHaveLength(2)
    expect(grouped.__no_location).toHaveLength(1)
  })

  it('handles API error during fetch gracefully', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    mockGetHives.mockRejectedValue(new Error('API Error'))

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    expect(console.error).toHaveBeenCalled()
  })

  it('handles missing apiaries gracefully (404)', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    mockGetHives.mockResolvedValue({ items: [] })
    mockGetApiaries.mockRejectedValue({ response: { status: 404 } })

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const vm = wrapper.vm as any
    expect(vm.apiaries).toEqual({})
  })

  it('sets dragging state on drag start', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    mockGetHives.mockResolvedValue({
      items: [{ id: 'h1', hiveNumber: 'H-001' }]
    })

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const vm = wrapper.vm as any
    const setDataMock = vi.fn()
    const mockEvent = {
      dataTransfer: { setData: setDataMock }
    } as any

    vm.onDragStart(mockEvent, { id: 'h1' })

    expect(vm.dragging).toBe('h1')
    expect(setDataMock).toHaveBeenCalledWith('text/plain', 'h1')
    expect(setDataMock).toHaveBeenCalledWith('application/hive-id', 'h1')
  })

  it('does not allow dropping onto __no_location', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const vm = wrapper.vm as any
    vm.onDragEnter('__no_location')

    expect(vm.dragOverKey).toBe(null)
  })

  it('sets dragOverKey when entering valid apiary', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const vm = wrapper.vm as any
    vm.onDragEnter('a1')

    expect(vm.dragOverKey).toBe('a1')
  })

  it('clears dragOverKey on drag leave', async () => {
    const pinia = createPinia()
    const store = useUserStore(pinia)
    store.token = 'test-token'

    const wrapper = shallowMount(HiveList, {
      global: { plugins: [pinia] }
    })
    await flushPromises()

    const vm = wrapper.vm as any
    vm.dragOverKey = 'a1'
    vm.onDragLeave('a1')

    expect(vm.dragOverKey).toBe(null)
  })
})
