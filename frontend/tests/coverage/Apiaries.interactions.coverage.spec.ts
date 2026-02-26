import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

vi.mock('../../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    getApiV1Apiaries: vi.fn(),
    getApiV1Hives: vi.fn(),
  },
}))

vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: vi.fn()
  }),
  Notify: {
    create: vi.fn()
  }
}))

vi.mock('../../src/utils/apiaryColor', () => ({
  apiaryColor: (id: string, color?: string) => color || '#B0BEC5'
}))

import Apiaries from '../../src/pages/Apiaries.vue'
import { DefaultService } from '../../src/api-client/services/DefaultService'

describe('Apiaries Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(DefaultService.getApiV1Apiaries).mockResolvedValue([])
    vi.mocked(DefaultService.getApiV1Hives).mockResolvedValue({ items: [] } as any)
    global.fetch = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('loads apiaries and computes hive counts', async () => {
    vi.mocked(DefaultService.getApiV1Apiaries).mockResolvedValue([
      { id: 'a1', name: 'Apiary 1', color: '#ff0000' },
      { _id: { $oid: 'a2' }, name: 'Apiary 2', color: '#00ff00' }
    ] as any)
    vi.mocked(DefaultService.getApiV1Hives).mockResolvedValue({
      items: [
        { apiaryId: 'a1' },
        { apiaryId: 'a1' },
        { apiaryId: 'a2' },
      ]
    } as any)

    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    
    expect(vm.apiaries).toHaveLength(2)
    expect(vm.hiveCounts.a1).toBe(2)
    expect(vm.hiveCounts.a2).toBe(1)
    expect(vm.loading).toBe(false)
  })

  it('handles load error gracefully', async () => {
    vi.mocked(DefaultService.getApiV1Apiaries).mockRejectedValue(new Error('API Error'))

    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    
    expect(vm.$q.notify).toHaveBeenCalledWith({
      type: 'negative',
      message: 'API Error'
    })
    expect(vm.loading).toBe(false)
  })

  it('handles missing hives gracefully', async () => {
    vi.mocked(DefaultService.getApiV1Apiaries).mockResolvedValue([{ id: 'a1', name: 'Apiary 1' }] as any)
    vi.mocked(DefaultService.getApiV1Hives).mockRejectedValue(new Error('Not found'))

    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    
    expect(vm.apiaries).toHaveLength(1)
    expect(vm.hiveCounts).toEqual({})
  })

  it('opens create dialog with default form', async () => {
    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.openCreate()

    expect(vm.dialogVisible).toBe(true)
    expect(vm.editingId).toBe(null)
    expect(vm.form.name).toBe('')
    expect(vm.form.color).toBe('#FFCA28')
  })

  it('opens edit dialog with apiary data', async () => {
    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const apiary = { id: 'a1', name: 'Test Apiary', color: '#123456' }
    const vm = wrapper.vm as any
    vm.openEdit(apiary)

    expect(vm.dialogVisible).toBe(true)
    expect(vm.editingId).toBe('a1')
    expect(vm.form.name).toBe('Test Apiary')
    expect(vm.form.color).toBe('#123456')
  })

  it('does not save if name is empty', async () => {
    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.form.name = '   '
    
    await vm.save()

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('creates new apiary successfully', async () => {
    vi.mocked(DefaultService.getApiV1Apiaries).mockResolvedValue([] as any)
    
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'new-id', name: 'New Apiary' })
    })
    global.fetch = mockFetch

    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.form.name = 'New Apiary'
    vm.form.color = '#ff0000'
    vm.editingId = null
    
    await vm.save()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/apiaries'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New Apiary', color: '#ff0000' })
      })
    )
    expect(vm.$q.notify).toHaveBeenCalledWith({
      type: 'positive',
      message: 'messages.location_created'
    })
    expect(vm.dialogVisible).toBe(false)
  })

  it('updates existing apiary successfully', async () => {
    vi.mocked(DefaultService.getApiV1Apiaries).mockResolvedValue([] as any)
    
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'a1', name: 'Updated Apiary' })
    })
    global.fetch = mockFetch

    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.form.name = 'Updated Apiary'
    vm.form.color = '#00ff00'
    vm.editingId = 'a1'
    
    await vm.save()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/apiaries/a1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Apiary', color: '#00ff00' })
      })
    )
    expect(vm.$q.notify).toHaveBeenCalledWith({
      type: 'positive',
      message: 'messages.updated'
    })
    expect(vm.dialogVisible).toBe(false)
  })

  it('handles save error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => 'Save failed'
    })
    global.fetch = mockFetch

    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.form.name = 'Test'
    
    await vm.save()
    await flushPromises()

    expect(vm.$q.notify).toHaveBeenCalledWith({
      type: 'negative',
      message: 'Save failed'
    })
    expect(vm.saving).toBe(false)
  })

  it('opens delete confirmation dialog', async () => {
    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.askDelete('a1')

    expect(vm.confirmDeleteVisible).toBe(true)
    expect(vm.deletingId).toBe('a1')
  })

  it('deletes apiary successfully', async () => {
    vi.mocked(DefaultService.getApiV1Apiaries).mockResolvedValue([] as any)
    
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true
    })
    global.fetch = mockFetch

    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.deletingId = 'a1'
    
    await vm.confirmDelete()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/apiaries/a1'),
      expect.objectContaining({
        method: 'DELETE'
      })
    )
    expect(vm.$q.notify).toHaveBeenCalledWith({
      type: 'positive',
      message: 'messages.deleted'
    })
    expect(vm.confirmDeleteVisible).toBe(false)
  })

  it('handles delete error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => 'Delete failed'
    })
    global.fetch = mockFetch

    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.deletingId = 'a1'
    
    await vm.confirmDelete()
    await flushPromises()

    expect(vm.$q.notify).toHaveBeenCalledWith({
      type: 'negative',
      message: 'Delete failed'
    })
    expect(vm.deleting).toBe(false)
  })

  it('does not delete if no id is set', async () => {
    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.deletingId = null
    
    await vm.confirmDelete()

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('normalizes apiary IDs from ObjectId format', async () => {
    vi.mocked(DefaultService.getApiV1Apiaries).mockResolvedValue([
      { _id: { $oid: 'id1' }, name: 'A1' },
      { id: 'id2', name: 'A2' },
      { _id: 'id3', name: 'A3' }
    ] as any)

    const wrapper = shallowMount(Apiaries)
    await flushPromises()

    const vm = wrapper.vm as any
    
    expect(vm.apiaries[0].id).toBe('id1')
    expect(vm.apiaries[1].id).toBe('id2')
    expect(vm.apiaries[2].id).toBe('id3')
  })
})
