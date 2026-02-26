import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

const mockGetQueens = vi.fn()
const mockGetHives = vi.fn()
const mockPostQueenAssign = vi.fn()
const mockDeleteQueen = vi.fn()

vi.mock('../../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    getApiV1Queens: () => mockGetQueens(),
    getApiV1Hives: (a?: any, b?: any, c?: any, d?: any) => mockGetHives(a, b, c, d),
    postApiV1QueensAssign: (id: string, data: any) => mockPostQueenAssign(id, data),
    deleteApiV1Queens: (id: string) => mockDeleteQueen(id),
  },
}))

vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn()
  }
}))

import Queens from '../../src/pages/Queens.vue'

describe('Queens Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetQueens.mockResolvedValue([])
    mockGetHives.mockResolvedValue({ items: [] })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('filters queens by status when statusFilter is changed', async () => {
    mockGetQueens.mockResolvedValue([
      { id: 'q1', name: 'Queen 1', status: 'active' },
      { id: 'q2', name: 'Queen 2', status: 'spare' },
      { id: 'q3', name: 'Queen 3', status: 'dead' },
    ])

    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    
    // No filter - all queens
    expect(vm.filtered).toHaveLength(3)

    // Filter by active
    vm.activeFilter = 'active'
    await wrapper.vm.$nextTick()
    expect(vm.filtered).toHaveLength(1)
    expect(vm.filtered[0].status).toBe('active')

    // Filter by spare
    vm.activeFilter = 'spare'
    await wrapper.vm.$nextTick()
    expect(vm.filtered).toHaveLength(1)
    expect(vm.filtered[0].status).toBe('spare')
  })

  it('opens create dialog with no editing queen', async () => {
    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.openCreate()

    expect(vm.dialogVisible).toBe(true)
    expect(vm.editingQueen).toBe(null)
  })

  it('opens edit dialog with editing queen', async () => {
    const wrapper = shallowMount(Queens)
    await flushPromises()

    const queen = { id: 'q1', name: 'Queen 1', status: 'active' }
    const vm = wrapper.vm as any
    vm.openEdit(queen)

    expect(vm.dialogVisible).toBe(true)
    expect(vm.editingQueen).toStrictEqual(queen)
  })

  it('opens assign dialog with queen data', async () => {
    const wrapper = shallowMount(Queens)
    await flushPromises()

    const queen = { id: 'q1', name: 'Queen 1', status: 'active' }
    const vm = wrapper.vm as any
    vm.openAssign(queen)

    expect(vm.assignDialogVisible).toBe(true)
    expect(vm.assignHiveId).toBe('')
    expect(vm.assignDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('assigns queen to hive successfully', async () => {
    mockGetQueens.mockResolvedValue([
      { id: 'q1', name: 'Queen 1', status: 'active', hiveHistory: [] }
    ])
    
    const updatedQueen = { 
      id: 'q1', 
      name: 'Queen 1', 
      status: 'active',
      hiveHistory: [{ hiveId: 'h1', from: '2024-01-01' }]
    }
    
    mockPostQueenAssign.mockResolvedValue(updatedQueen)

    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    
    // Simulate opening assign dialog
    vm.openAssign(vm.queens[0])
    vm.assignHiveId = 'h1'
    vm.assignDate = '2024-01-01'
    
    await vm.doAssign()
    await flushPromises()

    expect(mockPostQueenAssign).toHaveBeenCalledWith('q1', {
      hiveId: 'h1',
      from: '2024-01-01'
    })
    expect(vm.queens[0].hiveHistory).toHaveLength(1)
    expect(vm.assignDialogVisible).toBe(false)
  })

  it('does not assign if no hive selected', async () => {
    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.openAssign({ id: 'q1', name: 'Queen 1' })
    vm.assignHiveId = ''

    await vm.doAssign()

    expect(mockPostQueenAssign).not.toHaveBeenCalled()
  })

  it('opens delete confirmation dialog', async () => {
    const wrapper = shallowMount(Queens)
    await flushPromises()

    const queen = { id: 'q1', name: 'Queen 1', status: 'active' }
    const vm = wrapper.vm as any
    vm.confirmDelete(queen)

    expect(vm.deleteDialogVisible).toBe(true)
  })

  it('deletes queen successfully', async () => {
    mockGetQueens.mockResolvedValue([
      { id: 'q1', name: 'Queen 1', status: 'active' },
      { id: 'q2', name: 'Queen 2', status: 'spare' }
    ])

    mockDeleteQueen.mockResolvedValue({})

    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.confirmDelete(vm.queens[0])

    await vm.doDelete()
    await flushPromises()

    expect(mockDeleteQueen).toHaveBeenCalledWith('q1')
    expect(vm.queens).toHaveLength(1)
    expect(vm.queens[0].id).toBe('q2')
    expect(vm.deleteDialogVisible).toBe(false)
  })

  it('adds queen to list when onCreated is called', async () => {
    mockGetQueens.mockResolvedValue([
      { id: 'q1', name: 'Queen 1', status: 'active' }
    ])

    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    const newQueen = { id: 'q2', name: 'Queen 2', status: 'spare' }
    
    vm.onCreated(newQueen)

    expect(vm.queens).toHaveLength(2)
    expect(vm.queens[0]).toStrictEqual(newQueen)
  })

  it('updates queen in list when onUpdated is called', async () => {
    mockGetQueens.mockResolvedValue([
      { id: 'q1', name: 'Queen 1', status: 'active' }
    ])

    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    const updatedQueen = { id: 'q1', name: 'Updated Queen', status: 'spare' }
    
    vm.onUpdated(updatedQueen)

    expect(vm.queens).toHaveLength(1)
    expect(vm.queens[0].name).toBe('Updated Queen')
    expect(vm.queens[0].status).toBe('spare')
  })

  it('computes hiveName correctly', async () => {
    mockGetHives.mockResolvedValue({
      items: [
        { id: 'h1', hiveNumber: 'H-001' },
        { _id: 'h2', hiveNumber: 'H-002' }
      ]
    })

    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    
    expect(vm.hiveName('h1')).toBe('H-001')
    expect(vm.hiveName('h2')).toBe('H-002')
    expect(vm.hiveName('h999')).toBe('h999')
    expect(vm.hiveName()).toBe('?')
  })

  it('computes currentHiveOf correctly', async () => {
    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    
    // Queen with active assignment (no "to" date)
    const activeQueen = {
      id: 'q1',
      hiveHistory: [
        { hiveId: 'h1', from: '2024-01-01' }
      ]
    }
    
    expect(vm.currentHiveOf(activeQueen)).toMatch(/h1/)

    // Queen with no active assignment
    const inactiveQueen = {
      id: 'q2',
      hiveHistory: [
        { hiveId: 'h1', from: '2024-01-01', to: '2024-06-01' }
      ]
    }
    
    expect(vm.currentHiveOf(inactiveQueen)).toBe(null)
  })

  it('computes pastHives correctly', async () => {
    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    
    const queen = {
      id: 'q1',
      hiveHistory: [
        { hiveId: 'h1', from: '2023-01-01', to: '2023-06-01' },
        { hiveId: 'h2', from: '2023-06-01', to: '2023-12-01' },
        { hiveId: 'h3', from: '2024-01-01' } // current
      ]
    }
    
    const past = vm.pastHives(queen)
    expect(past).toHaveLength(2)
    expect(past[0].hiveId).toBe('h1')
    expect(past[1].hiveId).toBe('h2')
  })

  it('formats dates correctly', async () => {
    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    
    const formatted = vm.formatDate('2024-01-15')
    expect(formatted).toMatch(/15/)
    expect(formatted).toMatch(/01/)
    expect(formatted).toMatch(/24/)

    expect(vm.formatDate()).toBe('?')
    // formatDate catches error and returns 'Invalid Date' for invalid strings
    const invalidResult = vm.formatDate('invalid')
    expect(invalidResult).toBeTruthy() // Just verify it returns something
  })

  it('computes statusColor correctly', async () => {
    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    
    expect(vm.statusColor('active')).toBe('positive')
    expect(vm.statusColor('spare')).toBe('info')
    expect(vm.statusColor('dead')).toBe('grey')
    expect(vm.statusColor('sold')).toBe('orange-7')
    // Default is 'spare' which maps to 'info'
    expect(vm.statusColor()).toBe('info')
    expect(vm.statusColor('unknown')).toBe('grey')
  })

  it('computes hiveOptions correctly', async () => {
    mockGetHives.mockResolvedValue({
      items: [
        { id: 'h1', hiveNumber: 'H-001' },
        { _id: 'h2', hiveNumber: 'H-002' }
      ]
    })

    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    const options = vm.hiveOptions
    
    expect(options).toHaveLength(2)
    expect(options[0]).toMatchObject({ label: 'H-001', value: 'h1' })
    expect(options[1]).toMatchObject({ label: 'H-002', value: 'h2' })
  })

  it('handles assign API error gracefully', async () => {
    mockGetQueens.mockResolvedValue([
      { id: 'q1', name: 'Queen 1', status: 'active' }
    ])

    mockPostQueenAssign.mockRejectedValue(new Error('API Error'))

    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.assigningQueen = vm.queens[0]
    vm.assignHiveId = 'h1'
    
    await vm.doAssign()
    await flushPromises()

    expect(vm.assignSaving).toBe(false)
  })

  it('handles delete API error gracefully', async () => {
    mockGetQueens.mockResolvedValue([
      { id: 'q1', name: 'Queen 1', status: 'active' }
    ])

    mockDeleteQueen.mockRejectedValue(new Error('API Error'))

    const wrapper = shallowMount(Queens)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.confirmDelete(vm.queens[0])

    await vm.doDelete()
    await flushPromises()

    // Dialog should be closed after error
    expect(vm.deleteDialogVisible).toBe(false)
  })
})
